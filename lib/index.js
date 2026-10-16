//#region lib/index.js
/**
 * Host half of the boot-splash plugin. The plugin contributes browser
 * presentation only, so this half is an empty Loader seat: it gives the
 * profile a host-side row while the browser half ships through
 * `exports["./client"]` and is served by `dsh-client-modules`.
 */

/** Host plugin body — this package contributes browser presentation only. */
function apply() {}

export { apply };
//#endregion
