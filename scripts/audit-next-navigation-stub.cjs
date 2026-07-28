module.exports = {
  usePathname: () => "/",
  useRouter: () => ({
    push() {},
    refresh() {},
    replace() {},
  }),
  useSearchParams: () => new URLSearchParams(),
};
