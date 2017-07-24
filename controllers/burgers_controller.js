var express = require("express");

var router = express.Router();

var db = require("../models");
var j = 0;



router.get("/", function(req, res) {
    

    db.Burger.findAll({
            include: [db.Customer]
        })
        .then(function(dbPost) {
            var hbsObject = {
                burgers: dbPost
            };
            console.log(hbsObject);
            res.render("index", hbsObject);

        });

       
});

router.post("/", function(req, res) {

    db.Burger.create({
        burger_name: req.body.name
    }).then(function(dbPost) {
        res.redirect("/");
    });

});

router.put("/:id", function(req, res) {

    db.Customer.findAll().then(function(dbCustomer) {

        if (j === 0) {

            db.Customer.create({
                customer_name: req.body.customer
            }).then(function(dbCustomer) {
                db.Burger.update({
                    devoured: req.body.devoured,
                    CustomerId: dbCustomer.id
                }, {
                    where: {
                        id: req.params.id
                    },
                    include: [db.Customer]
                }).then(function(dbBurger) {
                    res.redirect("/");


                });
            });
            j++;

        } else {




            for (var i = 0; i < dbCustomer.length; i++) {
                if (dbCustomer[i].dataValues.customer_name === req.body.customer) {
                    db.Burger.update({
                        devoured: req.body.devoured,
                        CustomerId: dbCustomer[i].dataValues.id
                    }, {
                        where: {
                            id: req.params.id
                        },
                        include: [db.Customer]
                    }).then(function(dbBurger) {
                        res.redirect("/");


                    });

                } else {

                    db.Customer.create({
                        customer_name: req.body.customer
                    }).then(function(dbCustomer) {
                        db.Burger.update({
                            devoured: req.body.devoured,
                            CustomerId: dbCustomer.id
                        }, {
                            where: {
                                id: req.params.id
                            },
                            include: [db.Customer]
                        }).then(function(dbBurger) {
                            res.redirect("/");


                        });
                    });


                }
            }
        };


    });




});




module.exports = router;