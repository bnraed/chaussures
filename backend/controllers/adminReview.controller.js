import Review from "../models/Review.js";
import Shoe from "../models/Shoe.js";

// GET /api/admin/reviews  => liste à plat de tous les avis (depuis Review collection)
export const adminGetAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({})
      .populate("shoe", "name")     // shoe.name
      .populate("user", "email")   // user.email
      .sort({ createdAt: -1 });

    const rows = reviews.map((r) => ({
      reviewId: r._id,
      shoeId: r.shoe?._id || r.shoe,
      shoeName: r.shoe?.name || "—",
      rating: r.rating,
      comment: r.comment,
      user: r.user?._id || r.user,
      userName: r.user?.email || "—",
      createdAt: r.createdAt,
    }));

    res.json(rows);
  } catch (e) {
    next(e);
  }
};

// DELETE /api/admin/reviews/:shoeId/:reviewId
// (on garde la route identique, mais on supprime dans Review)
export const adminDeleteReview = async (req, res, next) => {
  try {
    const { shoeId, reviewId } = req.params;

    const deleted = await Review.findByIdAndDelete(reviewId);
    if (!deleted) return res.status(404).json({ message: "Avis introuvable" });

    // ✅ Recalcul rating/numReviews dans Shoe (utile si tu affiches rating ailleurs)
    const stats = await Review.aggregate([
      { $match: { shoe: deleted.shoe } },
      {
        $group: {
          _id: "$shoe",
          avg: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    const avg = stats[0]?.avg || 0;
    const count = stats[0]?.count || 0;

    await Shoe.findByIdAndUpdate(
      deleted.shoe,
      { rating: avg, numReviews: count },
      { new: true }
    );

    res.json({ message: "Avis supprimé ✅" });
  } catch (e) {
    next(e);
  }
};
