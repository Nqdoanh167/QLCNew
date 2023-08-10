const functions = require('../../services/functions');
const Cart = require('../../models/Raonhanh365/Cart');
const News = require('../../models/Raonhanh365/New');

exports.getListCartByUserId = async (req, res, next) => {
  try {

    let userId = req.user.data.idRaoNhanh365,
      page = Number(req.body.page),
      pageSize = Number(req.body.pageSize);
    if (!page || !pageSize) {
      return functions.setError(res, "Missing input value", 403);
    }
    const skip = (page - 1) * pageSize;
    const limit = pageSize;
    let data = await Cart.aggregate([
      {
        $lookup: {
          from: 'Users',
          localField: 'userId',
          foreignField: 'idRaoNhanh365',
          as: 'user'
        }
      },
      {
        $lookup: {
          from: 'RN365_News',
          localField: 'newsId',
          foreignField: '_id',
          as: 'new'
        }
      },
      {
        $match:{userId}
      },
      {
        $skip:skip
      },
      {
        $limit:limit
      },
      {
        $project:{quantity:1,unit:1,status:1,new:{_id:1,title:1,linkTitle:1,img:1,timePromotionStart:1,timePromotionEnd:1,baohanh:1},user:{userName:1,type:1}}
      }
    ])
    return functions.success(res, "get list cart success", { data });
  } catch (e) {
    console.log("Err from server", e);
    return functions.setError(res, "Err from server", 500);
  }
}

//admin them tin vao cart
exports.addCart = async (req, res, next) => {
  try {
    let userId = req.user.data.idRaoNhanh365;
    let { newsId, quantity,type } = req.body;
    if ( !newsId || !quantity ) {
      return functions.setError(res, "Missing input value!", 404);
    }

    let quantityUpdate = quantity;
    let cart = await Cart.findOne({ userId: userId, newsId: newsId });
    if (cart) {
      quantityUpdate = Number(cart.quantity) + Number(quantity);
      await Cart.findOneAndUpdate({ userId, newsId }, {
        quantity: quantityUpdate,type,total
      });
      return functions.success(res, 'Add cart RN365 success!');
    }

    const maxIdCart = await Cart.findOne({}, { _id: 1 }).sort({ _id: -1 }).limit(1).lean();
    let newIdCart;
    if (maxIdCart) {
      newIdCart = Number(maxIdCart._id) + 1;
    } else newIdCart = 1;

    cart = new Cart({
      _id: newIdCart,
      userId: userId,
      newsId: newsId,
      quantity: quantity,
      type
    });
    await cart.save();
    return functions.success(res, 'Add cart RN365 success!');
  } catch (e) {
    console.log("Err from server!", e);
    return functions.setError(res, "Err from server!", 500);
  }
}

exports.removeCart = async (req, res, next) => {
  try {

    let idCart = Number(req.body.idCart);
    if (idCart) {
      let cart = await functions.getDataDeleteOne(Cart, { _id: idCart });
      if (cart.deletedCount === 1) {
        return functions.success(res, `Remove new from cart with _id=${idCart} success`);
      } else {
        return functions.success(res, "Cart not found");
      }
    }
    return functions.setError(res, "Missing input idCart", 505);
  } catch (e) {
    console.log("Error from server", e);
    return functions.setError(res, "Error from server", 500);
  }
}