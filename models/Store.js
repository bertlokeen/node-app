const moongoose = require('mongoose');
moongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new moongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: 'Please enter store name'
    },
    slug: String,
    description: {
        type: String,
        trim: true
    },
    tags: [String],
    created: {
        type: Date,
        default: Date.now
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [{
            type: Number,
            required: 'Coordinates are required.'
        }],
        address: {
            type: String,
            required: 'Address is required.'
        }
    },
    photo: String,
    author: {
        type: moongoose.Schema.ObjectId,
        ref: 'User',
        required: 'Author required.'
    }
});

storeSchema.pre('save', async function(next) {
    if (!this.isModified('name')) {
        next();
        return;
    }
    this.slug = slug(this.name);
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
    if(storesWithSlug.length) {
        this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
    }
    next();
});

storeSchema.statics.getTagsList = function() {
    return this.aggregate([
        { $unwind: '$tags'},
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
};

module.exports = moongoose.model('Store', storeSchema);