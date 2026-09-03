import { Can as AclCan } from "@povio/ui/auth";

import type { AppAbilities } from "@/openapi/acl/app.ability";

export const Can = AclCan<AppAbilities>;
