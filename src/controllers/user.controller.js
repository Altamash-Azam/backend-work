import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/APIError.js"
import {User} from '../models/user.model.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
    // get user detail from frontend
    const {fullName, username, email, password} = req.body
    console.log("email: ",email)

    //validation - not empty

    // if(fullName == ""){
    //     throw new APIError(400, "Full name is required")
    // }
    if(
        [fullName, email, username, password].some((field) => field?.trim()==="")
    ){
        throw new ApiError(400, "All fields are required")
    }

    // check if user already exists: email, username
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if(existedUser){
        throw new ApiError(409, "User with these credentials already exisits")
    }
    
    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    // upload them to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    // create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    


    // remove password and refresh token field from response

    // find user which was just created to confirm creation
    const foundUser = await User.findById(user._id).select("-password -refreshToken")

    if(!foundUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    // return response
    return res.status(201).json(
        new ApiResponse(200,createdUser, "User registered successfully")
    )
})

export {registerUser}