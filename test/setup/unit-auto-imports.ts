/**
 * The node `unit` Vitest project has no Nuxt auto-import transform, so source
 * files under `app/utils/**` that reference auto-imported globals (e.g. `POSTS`,
 * `SITE`, `toDate` from `shared/utils/**`) would throw `ReferenceError` when
 * imported directly. Register those globals here so unit tests can exercise the
 * real source without booting Nuxt. The `nuxt` project does not use this file.
 */
import * as dateUtils from "#shared/utils/date";
import * as i18nUtils from "#shared/utils/i18n";
import * as siteConsts from "#shared/utils/site";

Object.assign(globalThis, siteConsts, dateUtils, i18nUtils);
