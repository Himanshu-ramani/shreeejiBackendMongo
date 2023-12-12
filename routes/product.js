const Product = require("../models/Product");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

//CREATE

router.post("/", verifyTokenAndAdmin, async (req, res) => {
  const newProduct = new Product(req.body);

  try {
    const savedProduct = await newProduct.save();
    const modifiedProduct = {
      id: savedProduct._id.toString(), // Convert ObjectId to string for id field
      ...savedProduct._doc, // Spread other fields of the saved product
    };
    res.status(200).json(modifiedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    const modifiedProduct = {
      id: updatedProduct._id.toString(), // Convert ObjectId to string for id field
      ...updatedProduct._doc, // Spread other fields of the product
    };
    res.status(200).json(modifiedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("Product has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET PRODUCT
router.get("/find/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    const modifiedProduct = {
      id: product._id.toString(), // Convert ObjectId to string for id field
      ...product._doc, // Spread other fields of the product
    };

    res.status(200).json(modifiedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL PRODUCTS
router.get("/", async (req, res) => {
  const qNew = req.query.new;
  const qCategory = req.query.category;
  try {
    let products;

    if (qNew) {
      products = await Product.find().sort({ createdAt: -1 }).limit(1);
    } else if (qCategory) {
      products = await Product.find({
        categories: {
          $in: [qCategory],
        },
      });
    } else {
      products = await Product.find();
    }
    const modifiedProducts = products.map((product) => ({
      id: product._id.toString(), // Convert ObjectId to string for id field
      ...product._doc, // Spread other fields of the product
    }));

    res.status(200).json(modifiedProducts);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
