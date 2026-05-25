export const cookieOptions = ({ isProd = false, maxAgeMinutes, maxAgeDays } = {}) => {
  const base = {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/",
  };

  if (typeof maxAgeMinutes === "number") {
    base.maxAge = maxAgeMinutes * 60 * 1000;
  }

  if (typeof maxAgeDays === "number") {
    base.maxAge = maxAgeDays * 24 * 60 * 60 * 1000;
  }

  return base;
};
