import Shoe from "../models/Shoe.js";

const populateProduct = (q) => q.populate("categories", "name");

export const adminGetAllProducts = async (req, res, next) => {
  try {
    const products = await populateProduct(Shoe.find().sort({ createdAt: -1 }));
    res.json(products);
  } catch (e) {
    next(e);
  }
};

export const adminCreateProduct = async (req, res, next) => {
  try {
    const {
      name,
      brand,
      description,
      price,
      stock,
      gender,
      sizes,
      categoryIds, // ✅ array ids
      images,
    } = req.body;

    if (!name?.trim()) return res.status(400).json({ message: "Nom obligatoire" });
    if (!gender) return res.status(400).json({ message: "Genre obligatoire (Homme/Femme)" });

    const p = await Shoe.create({
      name: name.trim(),
      brand: brand?.trim() || "",
      description: description || "",
      price: Number(price || 0),
      stock: Number(stock || 0),
      gender,
      sizes: Array.isArray(sizes) ? sizes.map(Number) : [],
      categories: Array.isArray(categoryIds) ? categoryIds : [],
      images: Array.isArray(images) ? images : (images ? [images] : []),
    });

    const full = await populateProduct(Shoe.findById(p._id));
    res.status(201).json(full);
  } catch (e) {
    next(e);
  }
};

export const adminUpdateProduct = async (req, res, next) => {
  try {
    const p = await Shoe.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Produit introuvable" });

    const {
      name,
      brand,
      description,
      price,
      stock,
      gender,
      sizes,
      categoryIds,
      images,
    } = req.body;

    if (name !== undefined) p.name = String(name).trim();
    if (brand !== undefined) p.brand = String(brand).trim();
    if (description !== undefined) p.description = description || "";
    if (price !== undefined) p.price = Number(price);
    if (stock !== undefined) p.stock = Number(stock);
    if (gender !== undefined) p.gender = gender;
    if (sizes !== undefined) p.sizes = Array.isArray(sizes) ? sizes.map(Number) : [];
    if (categoryIds !== undefined) p.categories = Array.isArray(categoryIds) ? categoryIds : [];
    if (images !== undefined) p.images = Array.isArray(images) ? images : (images ? [images] : []);

    await p.save();

    const full = await populateProduct(Shoe.findById(p._id));
    res.json(full);
  } catch (e) {
    next(e);
  }
};

export const adminDeleteProduct = async (req, res, next) => {
  try {
    const p = await Shoe.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Produit introuvable" });

    await p.deleteOne();
    res.json({ message: "Produit supprimé" });
  } catch (e) {
    next(e);
  }
};

// upload images (multer requis)
export const adminUploadProductImages = async (req, res, next) => {
  try {
    const files = req.files || [];
    const urls = files.map((f) => `/uploads/${f.filename}`);
    res.status(201).json({ urls }); // ✅ frontend attend urls
  } catch (e) {
    next(e);
  }
};
