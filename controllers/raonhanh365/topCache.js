const City = require('../../models/Raonhanh365/City');
const functions = require('../../services/functions');
const category = require('../../models/Raonhanh365/Category');
const Tags = require('../../models/Raonhanh365/Tags');
const CateVl = require('../../models/Raonhanh365/CateVl');
const PhuongXa = require('../../models/Raonhanh365/PhuongXa');
const CateDetail = require('../../models/Raonhanh365/CateDetail');
const Category = require('../../models/Raonhanh365/Category');

exports.getTopCache = async (req, res, next) => {
    try {
        let data = {};
        let cate = await category.find({ active: 1, parentId: 0 },{_id:1,name:1}).lean()
        for (let i = 0; i < cate.length; i++) {
            let cateChild = await category.find({ parentId: cate[i]._id },{_id:1,name:1}).lean();
            if (cateChild && cateChild.length > 0) {
                for (let j = 0; j < cateChild.length; j++) {
                    let data = await CateDetail.findById(cateChild[j]._id);
                    let cateDetail = await Tags.find({ cateId: cateChild[j]._id }, { _id: 1, name: 1 })
                        cateChild[j].data = data
                        cateChild[j].cateDetail = cateDetail
                }
            }
            cate[i].cateChild = cateChild
            let all = await CateDetail.findById(i);
            cate[i].all = all

        }
        return functions.success(res, 'get data success', { cate })
    } catch (error) {
        console.log("🚀 ~ file: topCache.js:12 ~ exports.getTopCache= ~ error:", error)
        return functions.setError(res, error)
    }
}

exports.supportSellNew = async (req, res, next) => {
    try {
        let cateId = Number(req.body.id);
        let parentId = req.body.parentId;
        let data = {};
        if (!cateId) return functions.setError(res, 'missing data', 400)
        let search = req.body.search;
        let cateChild = await Category.find({ parentId: cateId })
        let CateDetail1 = [];
        if (!parentId) {
            CateDetail1 = await Tags.find({ cateId: cateId }, { _id: 1, name: 1 })
        } else {
            CateDetail1 = await Tags.find({ cateId: cateId, parentId }, { _id: 1, name: 1 })
        }
        // let productLine = await CateDetail.find({ _id: cateId })
        let checkCate = await CateDetail.findById(cateId);

        let brand = [];
        let lineOfBrand = [];
        if (checkCate && checkCate.brand.length > 0) {
            for (let i = 0; i < checkCate.brand.length; i++) {
                if (parentId == checkCate.brand[i].parent) {
                    brand.push(checkCate.brand[i])
                    // lineOfBrand.push(checkCate.brand[i].line)
                }

            }
        }

        // let loai = [];

        let line = [];
        if (checkCate && checkCate.allType.length > 0) {
            for (let i = 0; i < checkCate.allType.length; i++) {
                if (parentId == checkCate.allType[i].parent) {
                    line.push(checkCate.allType[i])
                }
            }
        }



        let screen = [];
        if (checkCate && checkCate.screen.length > 0) {
            for (let i = 0; i < checkCate.screen.length; i++) {
                if (parentId == checkCate.screen[i].parent) {
                    screen.push(checkCate.screen[i])
                }
            }
        }

        let colors = [];
        if (checkCate && checkCate.colors.length > 0) {
            for (let i = 0; i < checkCate.colors.length; i++) {
                if (parentId == checkCate.colors[i].parent) {
                    colors.push(checkCate.colors[i])
                }
            }
        }

        let origin = [];
        if (checkCate && checkCate.origin.length > 0) {
            for (let i = 0; i < checkCate.origin.length; i++) {
                if (parentId == checkCate.origin[i].parent) {
                    origin.push(checkCate.origin[i])
                }
            }
        }

        let petInfo = [];
        if (checkCate && checkCate.petInfo.length > 0) {
            for (let i = 0; i < checkCate.petInfo.length; i++) {
                if (parentId == checkCate.petInfo[i].parent) {
                    petInfo.push(checkCate.petInfo[i])
                }
            }
        }

        let petPurebred = [];
        if (checkCate && checkCate.petPurebred.length > 0) {
            for (let i = 0; i < checkCate.petPurebred.length; i++) {
                if (parentId == checkCate.petPurebred[i].parent) {
                    petPurebred.push(checkCate.petPurebred[i])
                }
            }
        }


        let processor = [];
        if (checkCate && checkCate.processor.length > 0) {
            for (let i = 0; i < checkCate.processor.length; i++) {
                if (parentId == checkCate.processor[i].parent) {
                    processor.push(checkCate.processor[i])
                }
            }
        }


        let productGroup = [];
        if (checkCate && checkCate.productGroup.length > 0) {
            for (let i = 0; i < checkCate.productGroup.length; i++) {
                if (parentId == checkCate.productGroup[i].parent) {
                    productGroup.push(checkCate.productGroup[i])
                }
            }
        }

        let productMaterial = [];
        if (checkCate && checkCate.productMaterial.length > 0) {
            for (let i = 0; i < checkCate.productMaterial.length; i++) {
                if (parentId == checkCate.productMaterial[i].parent) {
                    productMaterial.push(checkCate.productMaterial[i])
                }
            }
        }

        let productShape = [];
        if (checkCate && checkCate.productShape.length > 0) {
            for (let i = 0; i < checkCate.productShape.length; i++) {
                if (parentId == checkCate.productShape[i].parent) {
                    productShape.push(checkCate.productShape[i])
                }
            }
        }


        let sport = [];
        if (checkCate && checkCate.sport.length > 0) {
            for (let i = 0; i < checkCate.sport.length; i++) {
                if (parentId == checkCate.sport[i].parent) {
                    sport.push(checkCate.sport[i])
                }
            }
        }


        let storyAndRoom = [];
        if (checkCate && checkCate.storyAndRoom.length > 0) {
            for (let i = 0; i < checkCate.storyAndRoom.length; i++) {
                if (parentId == checkCate.storyAndRoom[i].parent) {
                    storyAndRoom.push(checkCate.storyAndRoom[i])
                }
            }
        }
        let capacity = [];
        if (checkCate && checkCate.capacity.length > 0) {
            for (let i = 0; i < checkCate.capacity.length; i++) {
                if (parentId == checkCate.capacity[i].parent) {
                    capacity.push(checkCate.capacity[i])
                }
            }
        }


        let warranty = [];
        if (checkCate && checkCate.warranty.length > 0) {
            for (let i = 0; i < checkCate.warranty.length; i++) {
                if (parentId == checkCate.warranty[i].parent) {
                    warranty.push(checkCate.warranty[i])
                }
            }
        }
        let city1 = [];
        if (search && search === 'city') {
            city1 = await City.find({ parentId: 0 })
        } else if (search && search === 'district') {
            city1 = await City.find({ parentId: parentId })
        } else if (search && search === 'ward') {
            city1 = await PhuongXa.find({ district_id: parentId })
        }

        if (cateChild.length > 0) data.cateChild = cateChild
        if (CateDetail.length > 0) data.CateDetail = CateDetail1
        //  if (productLine.length > 0) data.productLine = productLine
        if (brand.length > 0) data.brand = brand;
        if (line.length > 0) data.line = line;
        if (screen.length > 0) data.screen = screen;
        if (capacity.length > 0) data.capacity = capacity;
        if (colors.length > 0) data.colors = colors;
        if (origin.length > 0) data.origin = origin;
        if (petInfo.length > 0) data.petInfo = petInfo;
        if (petPurebred.length > 0) data.petPurebred = petPurebred;
        if (processor.length > 0) data.processor = processor;
        if (productGroup.length > 0) data.productGroup = productGroup;
        if (productMaterial.length > 0) data.productMaterial = productMaterial;
        if (productShape.length > 0) data.productShape = productShape;
        if (processor.length > 0) data.processor = processor;
        if (sport.length > 0) data.sport = sport;
        if (storyAndRoom.length > 0) data.storyAndRoom = storyAndRoom;
        if (city1.length.length > 0) data.city1 = city1;
        if (lineOfBrand.length > 0) data.lineOfBrand = lineOfBrand
        return functions.success(res, 'get data success', { data })
    } catch (err) {
        console.log("🚀 ~ file: topCache.js:97 ~ exports.supportSellNew= ~ err:", err)
        return functions.setError(res, err)
    }
}