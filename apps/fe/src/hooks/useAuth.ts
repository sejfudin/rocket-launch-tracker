import { AuthContext } from "@povio/ui/auth";

import type { UserModels } from "@/openapi/user/user.models";

export const useAuth = () => AuthContext.useAuth<UserModels.UserMeResponse>();
