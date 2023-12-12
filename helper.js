function getMediaType(contentType) {
  if (contentType.startsWith("image")) {
    return "image";
  } else if (contentType.startsWith("video")) {
    return "video";
  } else if (
    contentType.startsWith("application/pdf") ||
    contentType.startsWith("text")
  ) {
    return "document";
  } else {
    return "other";
  }
}
module.exports = { getMediaType };
