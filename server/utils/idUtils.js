export const normalizeId = (id) => {
  if (id === undefined || id === null) return null;

  if (typeof id === "object") {
    if (id._id !== undefined && id._id !== null) {
      return typeof id._id === "string" ? id._id : id._id.toString();
    }
    try {
      return id.toString();
    } catch (e) {
      return null;
    }
  }

  return typeof id === "string" ? id : id.toString();
};

export const equalsId = (a, b) => {
  return normalizeId(a) === normalizeId(b);
};
