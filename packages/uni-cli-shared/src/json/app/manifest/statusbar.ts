export function initAppStatusbar(
  manifestJson: Record<string, any>,
  pagesJson: UniApp.PagesJson
) {
  const { titleColor = '#000', backgroundColor = '#000000' } =
    pagesJson.globalStyle?.navigationBar || {}

  manifestJson.plus.statusbar = {
    immersed: 'supportedDevice',
    style: titleColor === '#000' ? 'dark' : 'light',
    background: backgroundColor,
  }
  return manifestJson
}
