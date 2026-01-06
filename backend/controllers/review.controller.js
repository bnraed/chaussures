import Review from "../models/Review.js";

// ✅ POST /api/shoes/:id/reviews  (front attendu)
export const createReviewForShoe = async (req, res, next) => {
  try {
    const shoeId = req.params.id;
    const { rating, comment } = req.body;

    const alreadyReviewed = await Review.findOne({
      shoe: shoeId,
      user: req.user._id,
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: "Tu as déjà laissé un avis." });
    }

    const review = await Review.create({
      shoe: shoeId,
      user: req.user._id,
      rating: Number(rating),
      comment: String(comment || "").trim(),
    });

    const populated = await Review.findById(review._id).populate("user", "email");
    res.status(201).json(populated);
  } catch (e) {
    next(e);
  }
};

// ✅ GET /api/shoes/:id/reviews (utile si tu veux afficher avis séparément)
export const getReviewsForShoe = async (req, res, next) => {
  try {
    const shoeId = req.params.id;

    const reviews = await Review.find({ shoe: shoeId })
      .populate("user", "email")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (e) {
    next(e);
  }
};

// --------------------
// ✅ Garde tes routes existantes (si tu les utilises ailleurs)
// --------------------

// CREATE REVIEW  (ex: POST /api/reviews)
export const createReview = async (req, res, next) => {
  try {
    const { shoe, rating, comment } = req.body;

    const alreadyReviewed = await Review.findOne({
      shoe,
      user: req.user._id,
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: "You already reviewed this shoe" });
    }

    const review = await Review.create({
      shoe,
      user: req.user._id,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (e) {
    next(e);
  }
};

// GET REVIEWS FOR A SHOE  (ex: GET /api/reviews/shoe/:shoeId)
export const getReviewsByShoe = async (req, res, next) => {
  try {
    const reviews = await Review.find({ shoe: req.params.shoeId })
      .populate("user", "email")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (e) {
    next(e);
  }
};
