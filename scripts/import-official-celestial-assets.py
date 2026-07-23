#!/usr/bin/env python3
"""Import bounded runtime derivatives from reviewed official celestial maps.

The script is intentionally opt-in and transactional. It downloads only the
reviewed products in docs/data/celestial-source-research.json, stages all output
outside public/, applies documented cartographic transforms, and updates the
runtime manifest/override ledger only after each derivative is validated.

Source masters remain in .cache/celestial-official and are not shipped.
"""
from __future__ import annotations

import argparse
import hashlib
import html
import io
import json
import re
import shutil
import sys
import tempfile
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Any

from PIL import Image, ImageChops, ImageOps

ROOT = Path(__file__).resolve().parents[1]
RESEARCH_PATH = ROOT / "docs/data/celestial-source-research.json"
MANIFEST_PATH = ROOT / "scripts/data/texture-runtime-manifest.json"
OVERRIDE_PATH = ROOT / "scripts/data/celestial-official-runtime-overrides.json"
ARTIFACT_PATH = ROOT / "test-artifacts/gate3b-official-asset-import.json"
SCALE_AUDIT_PATH = ROOT / "test-artifacts/gate3b-scale-audit.json"
DISTINCTIVENESS_PATH = ROOT / "test-artifacts/gate3b-texture-distinctiveness.json"
CACHE_DIR = ROOT / ".cache/celestial-official"
MAX_DOWNLOAD_BYTES = 80 * 1024 * 1024
USER_AGENT = "Helios official celestial asset importer/1.0"


@dataclass(frozen=True)
class ImportedAsset:
    body_id: str
    source_url: str
    resolved_download_url: str
    source_sha256: str
    runtime_sha256: str
    width: int
    height: int
    byte_size: int
    fallback_fill_fraction: float
    transforms: tuple[str, ...]


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json_atomic(path: Path, payload: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(
        "w", encoding="utf-8", delete=False, dir=path.parent, suffix=".tmp"
    ) as handle:
        json.dump(payload, handle, indent=2, ensure_ascii=False)
        handle.write("\n")
        temp_path = Path(handle.name)
    temp_path.replace(path)


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def fetch_bytes(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=45) as response:
        buffer = bytearray()
        while True:
            chunk = response.read(1024 * 256)
            if not chunk:
                break
            buffer.extend(chunk)
            if len(buffer) > MAX_DOWNLOAD_BYTES:
                raise RuntimeError(
                    f"Source exceeds {MAX_DOWNLOAD_BYTES // (1024 * 1024)} MiB limit: {url}"
                )
        return bytes(buffer)


def discover_raster_url(source_url: str) -> str:
    page = fetch_bytes(source_url).decode("utf-8", errors="replace")
    hrefs = [
        html.unescape(match)
        for match in re.findall(r'href=["\']([^"\']+)["\']', page, re.I)
    ]
    candidates: list[str] = []
    for href in hrefs:
        absolute = urllib.parse.urljoin(source_url, href)
        lower = absolute.lower().split("?", 1)[0]
        if not lower.endswith((".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff")):
            continue
        if any(token in lower for token in ("thumb", "thumbnail", "icon")):
            continue
        candidates.append(absolute)
    if not candidates:
        raise RuntimeError(f"No raster resource discovered on {source_url}")

    def score(url: str) -> tuple[int, int]:
        lower = url.lower()
        preferred = 0
        for token, weight in (
            ("_2048", 80),
            ("_1024", 70),
            ("browse", 60),
            ("full", 50),
            (".png", 30),
            (".jpg", 20),
            (".tif", -80),
        ):
            if token in lower:
                preferred += weight
        return preferred, -len(url)

    return max(candidates, key=score)


def runtime_manifest_asset(manifest: dict[str, Any], body_id: str) -> dict[str, Any]:
    matches = [asset for asset in manifest["assets"] if asset.get("bodyId") == body_id]
    if len(matches) != 1:
        raise RuntimeError(f"Expected one runtime manifest asset for {body_id}, found {len(matches)}")
    return matches[0]


def roll_horizontal(image: Image.Image, pixels: int) -> Image.Image:
    pixels %= image.width
    if pixels == 0:
        return image
    return ImageChops.offset(image, pixels, 0)


def validate_map_image(image: Image.Image, body_id: str) -> None:
    if image.width < 256 or image.height < 128:
        raise RuntimeError(f"Official map for {body_id} is too small: {image.size}")
    ratio = image.width / image.height
    if not 1.82 <= ratio <= 2.18:
        raise RuntimeError(
            f"Official map for {body_id} is not a near-2:1 global raster: {image.size}"
        )


def fallback_mask(image: Image.Image, threshold: int) -> Image.Image:
    if threshold <= 0:
        return Image.new("L", image.size, 0)
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    mask = Image.new("L", image.size, 0)
    target = mask.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            if a == 0 or max(r, g, b) <= threshold:
                target[x, y] = 255
    return mask


def transform_source(
    source_bytes: bytes,
    candidate: dict[str, Any],
    fallback_path: Path,
    target_size: tuple[int, int],
) -> tuple[Image.Image, float, tuple[str, ...]]:
    source = Image.open(io.BytesIO(source_bytes))
    source = ImageOps.exif_transpose(source).convert("RGB")
    validate_map_image(source, candidate["bodyId"])
    transforms: list[str] = []

    if candidate.get("flipHorizontal"):
        source = ImageOps.mirror(source)
        transforms.append("positive-west-to-positive-east-horizontal-flip")
    if candidate.get("seamShiftDeg") == 180:
        source = roll_horizontal(source, source.width // 2)
        transforms.append("0-360-to-minus180-180-seam-shift")

    source = source.resize(target_size, Image.Resampling.LANCZOS)
    fallback = Image.open(fallback_path).convert("RGB").resize(
        target_size, Image.Resampling.LANCZOS
    )
    mask = fallback_mask(source, int(candidate.get("blackNoDataThreshold", 0)))
    mask_histogram = mask.histogram()
    filled_pixels = sum(mask_histogram[1:]) / 255
    fill_fraction = filled_pixels / (target_size[0] * target_size[1])
    if filled_pixels:
        source = Image.composite(fallback, source, mask)
        transforms.append("documented-no-data-filled-from-procedural-fallback")
    transforms.append(f"bounded-lanczos-resize-{target_size[0]}x{target_size[1]}")
    transforms.append("webp-quality-88")
    return source, fill_fraction, tuple(transforms)


def import_candidate(
    candidate: dict[str, Any],
    manifest: dict[str, Any],
    staging_dir: Path,
) -> ImportedAsset:
    body_id = candidate["bodyId"]
    configured = candidate.get("preferredRuntimeDownloadUrl")
    resolved_url = configured or discover_raster_url(candidate["sourceUrl"])
    source_bytes = fetch_bytes(resolved_url)
    source_sha = sha256_bytes(source_bytes)
    cache_path = CACHE_DIR / body_id / f"{source_sha}.source"
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    if not cache_path.exists():
        cache_path.write_bytes(source_bytes)

    asset = runtime_manifest_asset(manifest, body_id)
    target_size = (int(asset["width"]), int(asset["height"]))
    fallback_path = ROOT / "public" / asset["path"].lstrip("/")
    output, fill_fraction, transforms = transform_source(
        source_bytes, candidate, fallback_path, target_size
    )
    staged_path = staging_dir / asset["path"].lstrip("/")
    staged_path.parent.mkdir(parents=True, exist_ok=True)
    output.save(staged_path, "WEBP", quality=88, method=6)
    runtime_bytes = staged_path.read_bytes()
    runtime_sha = sha256_bytes(runtime_bytes)
    if len(runtime_bytes) <= 512:
        raise RuntimeError(f"Derived runtime asset is implausibly small for {body_id}")
    return ImportedAsset(
        body_id=body_id,
        source_url=candidate["sourceUrl"],
        resolved_download_url=resolved_url,
        source_sha256=source_sha,
        runtime_sha256=runtime_sha,
        width=target_size[0],
        height=target_size[1],
        byte_size=len(runtime_bytes),
        fallback_fill_fraction=fill_fraction,
        transforms=transforms,
    )


def update_metadata(
    imported: list[ImportedAsset],
    research: dict[str, Any],
    manifest: dict[str, Any],
    overrides: dict[str, Any],
) -> None:
    imported_by_id = {asset.body_id: asset for asset in imported}
    candidates_by_id = {candidate["bodyId"]: candidate for candidate in research["candidates"]}
    override_by_id = {asset["bodyId"]: asset for asset in overrides.get("assets", [])}
    today = date.today().isoformat()

    for body_id, result in imported_by_id.items():
        candidate = candidates_by_id[body_id]
        manifest_asset = runtime_manifest_asset(manifest, body_id)
        manifest_asset.update(
            {
                "byteSize": result.byte_size,
                "decodedBytes": result.width * result.height * 4,
                "provider": candidate["provider"],
                "sourceId": f"official-derived-{body_id}",
                "attribution": (
                    f"{candidate['provider']}; bounded runtime derivative from "
                    f"{candidate['product']}. Source acknowledgement retained."
                ),
                "license": candidate.get(
                    "license",
                    "Official source product; product-specific use constraints recorded in source ledger.",
                ),
                "sha256": result.runtime_sha256,
                "sourceMasterPolicy": (
                    "Source master cached outside public/; only the bounded runtime derivative ships."
                ),
                "projection": "equirectangular",
                "northPoleConvention": "source-derived north-up after documented transforms",
                "primeMeridianVerified": False,
                "representationType": "derived-map",
                "sourceUrl": result.source_url,
                "resolvedDownloadUrl": result.resolved_download_url,
                "sourceSha256": result.source_sha256,
                "appliedOperations": list(result.transforms),
                "fallbackFillFraction": round(result.fallback_fill_fraction, 8),
            }
        )
        candidate.update(
            {
                "runtimeStatus": "integrated-derived-map",
                "integrationState": "runtime-derived-imported",
                "resolvedRuntimeDownloadUrl": result.resolved_download_url,
                "sourceSha256": result.source_sha256,
                "runtimeSha256": result.runtime_sha256,
                "importedAt": today,
                "fallbackFillFraction": round(result.fallback_fill_fraction, 8),
                "appliedOperations": list(result.transforms),
            }
        )
        override_by_id[body_id] = {
            "bodyId": body_id,
            "assetPath": manifest_asset["path"],
            "representation": "derived-map",
            "projection": "equirectangular",
            "northPoleConvention": "source-derived north-up after documented transforms",
            "flipY": False,
            "flipX": False,
            "textureLongitudeOffsetDeg": 0,
            "primeMeridianVerified": False,
            "orientationSourceId": f"official-derived-{body_id}",
            "visualCalibrationNote": (
                "Official map pixels transformed into a bounded runtime derivative; "
                "manual GPU seam, pole and landmark review remains required."
            ),
            "sourceId": f"official-derived-{body_id}",
        }

    overrides["schemaVersion"] = 1
    overrides["generatedAt"] = today
    overrides["assets"] = [override_by_id[key] for key in sorted(override_by_id)]


def update_scale_audit_for_imported(imported_ids: set[str]) -> None:
    if not SCALE_AUDIT_PATH.exists():
        return
    audit = load_json(SCALE_AUDIT_PATH)
    for body in audit.get("bodies", []):
        if body.get("bodyId") not in imported_ids:
            continue
        body["flags"] = [
            flag
            for flag in body.get("flags", [])
            if flag != "review:procedural-surface-gpu-review-required"
        ]
        if any(flag.startswith("fail:") for flag in body["flags"]):
            body["representationStatus"] = "fail"
        elif body["flags"]:
            body["representationStatus"] = "review"
        else:
            body["representationStatus"] = "pass"
    summary = {"total": len(audit.get("bodies", [])), "pass": 0, "review": 0, "fail": 0}
    for body in audit.get("bodies", []):
        summary[body["representationStatus"]] += 1
    audit["summary"] = summary
    write_json_atomic(SCALE_AUDIT_PATH, audit)


def difference_hash(path: Path, hash_size: int = 12) -> str:
    image = Image.open(path).convert("L").resize(
        (hash_size + 1, hash_size), Image.Resampling.LANCZOS
    )
    pixels = list(image.getdata())
    bits: list[int] = []
    for row in range(hash_size):
        offset = row * (hash_size + 1)
        for column in range(hash_size):
            bits.append(int(pixels[offset + column] > pixels[offset + column + 1]))
    value = 0
    for bit in bits:
        value = (value << 1) | bit
    return f"{value:0{(hash_size * hash_size + 3) // 4}x}"


def hamming(left: str, right: str) -> int:
    return (int(left, 16) ^ int(right, 16)).bit_count()


def update_distinctiveness_artifact(manifest: dict[str, Any]) -> None:
    celestial = [
        asset for asset in manifest["assets"] if asset["path"].startswith("/textures/celestial/")
    ]
    hashes = {
        asset["bodyId"]: difference_hash(ROOT / "public" / asset["path"].lstrip("/"))
        for asset in celestial
    }
    bodies = []
    for body_id, digest in sorted(hashes.items()):
        nearest_id, nearest_distance = min(
            (
                (other_id, hamming(digest, other_digest))
                for other_id, other_digest in hashes.items()
                if other_id != body_id
            ),
            key=lambda item: item[1],
        )
        bodies.append(
            {
                "bodyId": body_id,
                "dHash": digest,
                "nearestBodyId": nearest_id,
                "nearestHammingDistance": nearest_distance,
            }
        )
    minimum = min(body["nearestHammingDistance"] for body in bodies)
    write_json_atomic(
        DISTINCTIVENESS_PATH,
        {
            "schemaVersion": 1,
            "method": "12x12 grayscale difference hash; diagnostic only, GPU review remains required",
            "bodies": bodies,
            "summary": {
                "total": len(bodies),
                "minimumNearestHammingDistance": minimum,
                "pairsBelowReviewThreshold": sum(
                    body["nearestHammingDistance"] < 24 for body in bodies
                ),
            },
        },
    )

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="write successful derivatives")
    parser.add_argument("--body", action="append", default=[], help="limit to body ID")
    parser.add_argument("--strict", action="store_true", help="fail when any selected import fails")
    parser.add_argument(
        "--list", action="store_true", help="print reviewed automatic candidates and exit"
    )
    args = parser.parse_args()

    research = load_json(RESEARCH_PATH)
    manifest = load_json(MANIFEST_PATH)
    overrides = load_json(OVERRIDE_PATH)
    candidates = [
        candidate
        for candidate in research["candidates"]
        if candidate.get("importPolicy") == "automatic-derived-map"
    ]
    if args.body:
        requested = set(args.body)
        candidates = [candidate for candidate in candidates if candidate["bodyId"] in requested]
        missing = requested - {candidate["bodyId"] for candidate in candidates}
        if missing:
            raise SystemExit(f"Not an automatic reviewed raster candidate: {sorted(missing)}")
    if args.list:
        for candidate in candidates:
            print(f"{candidate['bodyId']}: {candidate['sourceUrl']}")
        return 0
    if not args.apply:
        parser.error("Use --apply to download and write runtime derivatives, or --list")

    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    imported: list[ImportedAsset] = []
    failures: list[dict[str, str]] = []
    with tempfile.TemporaryDirectory(prefix="helios-official-assets-") as temp:
        staging = Path(temp)
        for candidate in candidates:
            body_id = candidate["bodyId"]
            try:
                result = import_candidate(candidate, manifest, staging)
                imported.append(result)
                print(f"imported {body_id}: {result.width}x{result.height}")
            except Exception as error:  # noqa: BLE001 - batch import report is intentional
                failures.append({"bodyId": body_id, "error": str(error)})
                print(f"failed {body_id}: {error}", file=sys.stderr)
                if args.strict:
                    break

        if args.strict and failures:
            imported = []
        if imported:
            update_metadata(imported, research, manifest, overrides)
            for result in imported:
                relative = runtime_manifest_asset(manifest, result.body_id)["path"].lstrip("/")
                source = staging / relative
                target = ROOT / "public" / relative
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(source, target)
            write_json_atomic(RESEARCH_PATH, research)
            write_json_atomic(MANIFEST_PATH, manifest)
            write_json_atomic(OVERRIDE_PATH, overrides)
            update_scale_audit_for_imported({asset.body_id for asset in imported})
            update_distinctiveness_artifact(manifest)

    artifact = {
        "schemaVersion": 1,
        "generatedAt": date.today().isoformat(),
        "selected": [candidate["bodyId"] for candidate in candidates],
        "imported": [asset.__dict__ for asset in imported],
        "failures": failures,
        "manualGpuReviewRequired": bool(imported),
    }
    write_json_atomic(ARTIFACT_PATH, artifact)
    print(f"summary: imported={len(imported)} failed={len(failures)}")
    if not imported or (args.strict and failures):
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
