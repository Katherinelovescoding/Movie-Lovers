const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique:true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        type: {
            type: String,
            default: 'guest'
        },
        favourites:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref:'Movie'
            }
        ],
        savedWatchlists:[{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Watchlist'
        }]
});

userSchema.pre('save', async function(next) {
    if(! this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
}) 

userSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
}

module.exports = mongoose.model('User', userSchema);