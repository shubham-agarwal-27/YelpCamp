var express = require('express');
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

router.get("/", function(req, res){	
	Campground.find({}, function(err, allCampgrounds){
		if(err)
			console.log(err);
		else{
			res.render("campgrounds/index", {campgrounds : allCampgrounds, currentUser : req.user});	
		}
	})
	
});


router.post("/", middleware.isLoggedIn,function(req, res){
	var name = req.body.name;
	var image = req.body.image;
	var desc = req.body.description;
	var price = req.body.price;
	var author = {
		id : req.user._id,
		username : req.user.username
	};
	var newCampground = {name: name, price : price, image : image, description : desc, author : author};
	Campground.create(newCampground, function(err, newlyCreated){
		if(err){
			console.log(err);
		}
		else{
			req.flash("success", "Successfully added a new campground!");
			res.redirect("/campgrounds");
		}
	});
});

router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new");
});

router.get("/:id", function(req, res){
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err){
			console.log(err);
		}
		else{
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
	
});


router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req,res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err){
			res.redirect("/campgrounds");
		}
		else{
			res.render("campgrounds/edit", {campground : foundCampground});
		}
	})
});


router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
	//find and update the correct campground and redirect to show page
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
		if(err){
			
			redirect("/campgrounds");
		}
		else{
			req.flash("success", "Successfully editted the campgroound details!");
			res.redirect("/campgrounds/" + req.params.id);
		}
	})
});


//What about removing with comments?

router.delete("/:id", middleware.checkCampgroundOwnership, function(req,res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/campgrounds");
		}else{
			req.flash("success", "Successfully deleted the campground!");
			res.redirect("/campgrounds");
		}
	});
});


module.exports = router;