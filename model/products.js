const mongoose = require("mongoose");

// membuat schema (struktur collections)
const Products = mongoose.model("Products", {
  productCategory: {
    type: String,
    required: true,
  },
  productCode: {
    type: String,
    required: true,
  },
  productDescription: {
    type: String,
    required: true,
  },
  productDiscount: {
    type: Number,
    required: true,
  },
  productImageUrl: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  productPrice: {
    type: Number,
    required: true,
  },
  productStock: {
    type: Number,
    required: true,
  },
});

module.exports = {
  Products: Products,
};
