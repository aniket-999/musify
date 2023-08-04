const express = require("express");
const passport = require("passport");
const router = express.Router();
const Playlist = require("../models/Playlist");
const User = require("../models/User");
const Song = require("../models/Song");


//first we need to create a playlist
router.post("/create", passport.authenticate("jwt", {session: false}),
    async (req, res) => {
        const currentUser = req.user;
        const {name, thumbnail, songs} = req.body;
        if(!name || !thumbnail || !songs) {
            return res.status(301).json({err: "Please add name thumbnail and songs you need for creating the playlist"});
        }
        const playlistData = {
            name,
            thumbnail,
            songs,
            owner: currentUser._id,
            collaborators: [],
        }
        const playlist = await Playlist.create(playlistData);
        return res.status(200).json(playlist);
    }
);

//get a playlist Id
//now in order to get the playlist id in get request we use req.params.playlistId--> 
//cuz we used :playlustId we would be getting it as an object in parameter
router.get("/get/playlist/:playlistId", passport.authenticate("jwt", {session: false}),
async (req, res) => {
    const playlistId = req.params.playlistId; 
    const playlist = await Playlist.findOne({_id: playlistId});
    if(!playlist) {
        return res.status(301).json({err: "Invalid Id"});
    }
    return res.status(200).json(playlist);
});

//get all playlists made by the artist
router.get("/get/artist/:artistId", passport.authenticate("jwt", {session: false}),
async (req, res) => {
    const artistId = req.params.artistId;
    const artist = await User.findOne({_id:artistId});
    if(!artist) {
        return res.status(304).json({err: "Invalid Artits Id"});
    }
    const playlists = await Playlist.find({owner: artistId});
    return res.status(200).json({data: playlists});
});

//add a song to the playlist;
router.post("/add/song", passport.authenticate("jwt", {session: false}),
async (req, res) => {
    const currentUser = req.user;
    const {playlistId, songId} = req.body;
    const playlist = await Playlist.findOne({_id: playlistId});
    if(!playlist) {
        return res.status(304).json({err: "Playlist does not exist"});
    }

    //Now we need to check that if current user owns the playlist or is a collaborator of that playlist
    if(!playlist.owner.equals(currentUser._id) || !playlist.collaborators.includes(currentUser._id)) {
        return res.status(400).json({err: "Not allowed"});
    }

    //check if the song is valid or not
    const song = await Song.findOne({_id: songId});
    if(!song) {
        return res.status(304).json({err: "Song does not exist"});
    }

    //now we can add the song
    playlist.songs.push(songId);
    await playlist.save();
    return res.status(200).json(playlist);
});

module.exports = router;