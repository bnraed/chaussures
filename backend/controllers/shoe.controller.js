import Shoe from "../models/Shoe.js";

// GET /api/shoes?gender=Homme&categories=id1,id2&q=nike&minPrice=50&maxPrice=200&sort=price_asc&page=1&limit=12
export const getAllShoes = async (req, res, next) => {
  try {
    const {
      q,
      gender,
      categories,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {};

    // ✅ recherche text (name + description)
    if (q && q.trim()) {
      const s = q.trim();
      filter.$or = [
        { name: { $regex: s, $options: "i" } },
        { description: { $regex: s, $options: "i" } },
      ];
    }

    // ✅ gender
    if (gender && ["Homme", "Femme"].includes(gender)) {
      filter.gender = gender;
    }

    // ✅ categories: "id1,id2"
    if (categories && String(categories).trim()) {
      const ids = String(categories)
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

      if (ids.length) {
        // shoeSchema => categories: [ObjectId]
        filter.categories = { $in: ids };
      }
    }

    // ✅ price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined && minPrice !== "") filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== "") filter.price.$lte = Number(maxPrice);
    }

    // ✅ tri
    let sortObj = { createdAt: -1 }; // défaut => plus récent
    if (sort === "price_asc") sortObj = { price: 1 };
    if (sort === "price_desc") sortObj = { price: -1 };
    if (sort === "new") sortObj = { createdAt: -1 };

    // ✅ pagination
    const p = Math.max(1, Number(page || 1));
    const l = Math.min(50, Math.max(1, Number(limit || 12)));
    const skip = (p - 1) * l;

    const [items, total] = await Promise.all([
      Shoe.find(filter)
        .populate("categories", "name") // ✅ IMPORTANT: c'est "categories" pas "category"
        .sort(sortObj)
        .skip(skip)
        .limit(l),
      Shoe.countDocuments(filter),
    ]);

    res.json({
      items,
      page: p,
      limit: l,
      total,
      pages: Math.ceil(total / l),
    });
  } catch (e) {
    next(e);
  }
};

// GET /api/shoes/:id
export const getShoeById = async (req, res, next) => {
  try {
    const shoe = await Shoe.findById(req.params.id).populate("categories", "name");
    if (!shoe) return res.status(404).json({ message: "Produit introuvable" });
    res.json(shoe);
  } catch (e) {
    next(e);
  }
};
