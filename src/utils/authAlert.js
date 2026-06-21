import Swal from "sweetalert2";

export const showLoginSignupAlert = (navigate, options = {}) => {
  const {
    message = "Please register or login to continue.",
    title,
  } = options;

  return Swal.fire({
    icon: "info",
    title,
    text: message,
    showDenyButton: true,
    showCancelButton: false,
    showCloseButton: true,
    confirmButtonText: "Login",
    denyButtonText: "Sign up",
    confirmButtonColor: "#9333ea",
    denyButtonColor: "#a855f7",
    allowOutsideClick: true,
    allowEscapeKey: true,
    didOpen: () => {
      const container = Swal.getContainer();
      if (container) container.style.zIndex = "100002";
    },
  }).then((result) => {
    if (result.isConfirmed) {
      navigate("/login");
    } else if (result.isDenied) {
      navigate("/signup");
    }
  });
};

export const requireAuthForBooking = (navigate, { isAuthenticated, user }) => {
  if (!isAuthenticated || user?.role === "guest") {
    showLoginSignupAlert(navigate, {
      message: "Please sign up or login to book an appointment.",
    });
    return false;
  }
  return true;
};
