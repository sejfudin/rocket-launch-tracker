import { DateTime } from "luxon";
import { useEffect, useState } from "react";

import { LaunchUtils } from "@/utils/launch.utils";

export const useCountdown = (launch?: string | null) => {
  const [now, setNow] = useState(() => DateTime.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(DateTime.now());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return LaunchUtils.getCountdown(launch, now);
};
