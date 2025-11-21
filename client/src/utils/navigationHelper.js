let navigateFunction = null;

export const setNavigate = (navigate) => {
  navigateFunction = navigate;
};

export const redirectToLogin = () => {
  if (navigateFunction) {
    navigateFunction("/login");
  } else {
    const loginPath = window.location.hash
      ? `${window.location.origin}/#/login`
      : `${window.location.origin}/login`;
    window.location.replace(loginPath);
  }
};
