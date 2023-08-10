var TagBlog = require('../../models/Timviec365/Blog/TagBlog');
var functions = require('../../services/functions');

exports.relatedkeywords = async(title) => {
    // Từ khóa liên quan
    let key_blog = functions.clean_sp(title);
    const listTag = await TagBlog.find({
        $text: {
            $search: key_blog
        }
    }, {
        tag_url: 1,
        tag_key: 1,
    }).limit(12).lean();

    return listTag;
}