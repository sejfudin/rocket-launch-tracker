import { createAclGuard } from "@povio/ui/auth";

import type { AppAbilities } from "@/openapi/acl/app.ability";

export const AclGuard = createAclGuard<AppAbilities>();
