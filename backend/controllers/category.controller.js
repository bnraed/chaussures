import Category from "../models/Category.js";

// CREATE (admin)
export const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Nom catégorie obligatoire" });
    }

    const exists = await Category.findOne({ name: name.trim() });
    if (exists) {
      return res.status(409).json({ message: "Catégorie déjà existante" });
    }

    const category = await Category.create({ name: name.trim() });
    res.status(201).json(category);
  } catch (e) {
    next(e);
  }
};

// READ ALL (public)
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (e) {
    next(e);
  }
};

// READ ONE (public)
export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Catégorie introuvable" });
    res.json(category);
  } catch (e) {
    next(e);
  }
};

// UPDATE (admin)
export const updateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Nom catégorie obligatoire" });
    }

    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Catégorie introuvable" });

    // check duplicate
    const exists = await Category.findOne({ name: name.trim(), _id: { $ne: category._id } });
    if (exists) return res.status(409).json({ message: "Catégorie déjà existante" });

    category.name = name.trim();
    await category.save();

    res.json(category);
  } catch (e) {
    next(e);
  }
};

// DELETE (admin)
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Catégorie introuvable" });

    await category.deleteOne();
    res.json({ message: "Catégorie supprimée" });
  } catch (e) {
    next(e);
  }
};
