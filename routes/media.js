const router = require("express").Router();
const admin = require("firebase-admin");
const multer = require("multer");
const serviceAccount = require("./../shreeji-e4288-firebase-adminsdk-m0wea-739ca63554.json");
const { getMediaType } = require("../helper");
const bucket_url = "gs://shreeji-e4288.appspot.com";
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: bucket_url, // Replace with your storage bucket URL
});
const bucket = admin.storage().bucket();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit (adjust as needed)
  },
});
// Route for file upload
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send("No file uploaded.");
    }

    const filename = Date.now() + "_" + file.originalname?.replaceAll(" ", "-");
    const fileUpload = bucket.file(filename);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        acl: [{ entity: "allUsers", role: "READER" }],
      },
    });

    blobStream.on("error", (err) => {
      res.status(500).send(`Error uploading file: ${err}`);
    });

    blobStream.on("finish", () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`;
      //   const response = {
      //     name: fileUpload.name,
      //     contentType: file.mimetype,
      //     mediaType: getMediaType(file.mimetype),
      //     url: publicUrl
      //   };
      //   res.status(200).json(response);
      res.status(200).send({
        name: fileUpload.name,
        contentType: file.mimetype,
        mediaType: getMediaType(file.mimetype),
        url: publicUrl,
      });
    });

    blobStream.end(file.buffer);
  } catch (error) {
    res.status(500).send(`Error uploading file: ${error}`);
  }
});
router.get("/", async (req, res) => {
  try {
    const [files] = await bucket.getFiles({
      autoPaginate: false, // Ensures pagination is disabled to get all files at once
      // Sort files by their timeCreated in descending order
      delimiter: "/",
      maxResults: 1000, // Adjust based on your bucket size or use pagination
      orderBy: {
        field: "timeCreated",
        descending: true,
      },
    });

    // Promisify the makePublic operation for each file
    const makePublicPromises = files.map((file) => {
      return file
        .makePublic()
        .then(() => {
          return file; // Return the file once it's made public
        })
        .catch((err) => {
          console.error(`Error making file ${file.name} public:`, err);
          return null;
        });
    });

    // Wait for all files to be made public
    const updatedFiles = await Promise.all(makePublicPromises);

    // Filter out files that couldn't be made public
    const publicFiles = updatedFiles.filter((file) => file !== null);

    // Construct the response with URLs for publicly accessible files
    const formattedFiles = publicFiles.map((file) => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
      return {
        name: file.name,
        contentType: file.metadata.contentType,
        mediaType: getMediaType(file.metadata.contentType),
        url: publicUrl,
      };
    });

    res.status(200).json(formattedFiles);
  } catch (error) {
    res.status(500).send(`Error retrieving files: ${error}`);
  }
});
module.exports = router;
