const express = require("express");
const router = express.Router();
const Ticket = require("../models/Ticket");
const User = require("../models/User");
const Review = require("../models/Review");
const axios = require("axios");

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index", {
    loggedIn: req.user
  });
});

const loginCheck1 = () => {
  return (req, res, next) => {
    if (req.user) {
      next();
    } else {
      res.redirect(`/auth/loginCheck1`);
    }
  };
};

const loginCheck2 = () => {
  return (req, res, next) => {
    if (req.user) {
      next();
    } else {
      res.redirect("/auth/loginCheck2");
    }
  };
};

const loginCheck3 = () => {
  return (req, res, next) => {
    if (req.user) {
      next();
    } else {
      res.redirect("/auth/loginCheck3");
    }
  };
};
router.get("/profile/tickets", loginCheck2(), (req, res, next) => {
  //res.send('TICKETS')

  const owner = req.user;
  Ticket.find({
    owner
  })
    .populate("owner")
    .then(tickets => {
      return res.render("myTickets", {
        tickets: tickets,
        loggedIn: req.user
      });
    })
    .catch(err => {
      next(err);
    });
});

router.get("/profile", loginCheck1(), (req, res, next) => {
  let msg = "Thank you for signing up! Please, fill in your profile";

  User.findById(req.user.id)
    .then(user => {
      res.render("profile", {
        user: user,
        loggedIn: req.user,
        message: "Thank you for signing up! Please, fill in your profile"
      });
    })
    .catch(err => {
      next(err);
    });
});

router.get("/availableTickets/:sellerId", loginCheck1(), (req, res, next) => {
  //res.send(req.params.sellerId);
  // const rateUp = userRate => {
  //   return (userRate += 1);
  // };
  User.findById(req.params.sellerId)
    .then(user => {
      res.render("sellerProfile", {
        user: user,
        loggedIn: req.user
      });
    })
    .catch(err => {
      next(err);
    });
});

router.post("/:sellerId/rating", async (req, res, next) => {
  const rate = req.body.rating;

  const userId = req.params.sellerId;
  //let rating = req.params.rating === 'up' ? ;
  let seller = await User.findById(userId);
  const { username, password, name, surname, email } = seller;

  User.findByIdAndUpdate(
    userId,
    {
      username,
      password,
      name,
      surname,
      email,
      $push: { rate }
    },
    { new: true }
  )
    .then(updatedUser => {
      console.log("/////////////", updatedUser);
      res.json(updatedUser);
    })
    .catch(err => console.log(err));
});

router.get("/profile2", loginCheck1(), (req, res, next) => {
  User.findById(req.user.id)
    .then(user => {
      res.render("profile2", {
        user: user,
        loggedIn: req.user
      });
    })
    .catch(err => {
      next(err);
    });
});

router.get("/addTicket", loginCheck2(), (req, res, next) => {
  res.render("addTicket", {
    loggedIn: req.user
  });
});

router.post("/addTicket", loginCheck2(), (req, res, next) => {
  console.log("POST SERVER");
  const { ticketId, from, until, zone } = req.body;

  var today = new Date().toISOString();

  if (ticketId === "" || from === "" || until === "") {
    res.render("addTicket", {
      message: "Please, fill in all the fields.",
      loggedIn: req.user
    });
    return;
  }

  if (ticketId.length !== 14) {
    res.render("addTicket", {
      message:
        "The ticket number must have 14 characters. Please, insert numbers only.",
      loggedIn: req.user
    });
    return;
  }

  if (from < today - 1 || until < today - 1) {
    res.render("addTicket", {
      message: "The dates cannot be in the past.",
      loggedIn: req.user
    });
    return;
  }

  if (from > until) {
    res.render("addTicket", {
      message: "You have probably confused the dates.",
      loggedIn: req.user
    });
    return;
  }

  if (zone === "") {
    res.render("addTicket", {
      message: "Please, specify the zone.",
      loggedIn: req.user
    });
    return;
  }

  Ticket.create({
    availableFrom: req.body.from,
    availableUntil: req.body.until,
    zone: req.body.zone,
    owner: req.user._id,
    ticketId: req.body.ticketId
  })
    .then(() => {
      res.redirect(`/profile/tickets`);
    })
    .catch(err => {
      next(err);
    });
});

router.get("/search", loginCheck3(), (req, res, next) => {
  res.render("search", {
    loggedIn: req.user
  });
});

router.get("/profile/:ticketId", (req, res) => {
  // const id = ....
  // Ticket.fondOne(...).then(ticket => ....).catch(err => ...)
});

router.post("/availableTickets", loginCheck3(), (req, res, next) => {
  let { from, until, zone } = req.body;

  var today = new Date().toISOString();

  if (from === "" || until === "") {
    res.render("search", {
      message: "Please, fill in all the fields.",
      loggedIn: req.user
    });
    return;
  }

  if (from < today - 1 || until < today - 1) {
    res.render("search", {
      message: "The dates cannot be in the past.",
      loggedIn: req.user
    });
    return;
  }

  if (from > until) {
    res.render("search", {
      message: "You have probably confused the dates.",
      loggedIn: req.user
    });
    return;
  }

  if (zone === "") {
    res.render("search", {
      message: "Please, specify the zone.",
      loggedIn: req.user
    });
    return;
  }

  // zone = zone ==== "AB" ? "AB" :

  let dateFrom = new Date(from).getTime();
  let dateUntil = new Date(until).getTime();
  let days = (dateUntil - dateFrom) / (1000 * 3600 * 24) + 1;

  // let price;

  // if (zone === "AB" && days < 7) {
  //   price = 3;
  // } else if (zone === "AB" && days < 14) {
  //   price = 2.5;
  // } else if (zone === "AB") {
  //   price = 2;
  // } else if (zone === "ABC" && days < 7) {
  //   price = 3.5;
  // } else if (zone === "ABC" && days < 14) {
  //   price = 3;
  // } else {
  //   price = 2.5;
  // }

  // totalPrice = days * price;
  const totalPrice = (days, zoneInfo) => {
    let price;

    if (zoneInfo === "AB" && days < 7) {
      price = 3;
    } else if (zoneInfo === "AB" && days < 14) {
      price = 2.5;
    } else if (zoneInfo === "AB") {
      price = 2;
    } else if (zoneInfo === "ABC" && days < 7) {
      price = 3.5;
    } else if (zoneInfo === "ABC" && days < 14) {
      price = 3;
    } else {
      price = 2.5;
    }

    return price * days;
  };

  // console.log(zoneInfo, days, totalPrice);
  const sortingNumber = zone === "AB" ? 1 : -1;

  Ticket.find({
    availableFrom: {
      $lte: from
    },
    availableUntil: {
      $gte: until
    }
  })
    .populate("owner")
    .sort({
      zone: sortingNumber
    })
    .then(tickets => {
      const totalTest = {
        totalPrice: totalPrice
      };
      console.log(totalPrice);

      const allTickets = tickets.map(el => {
        el.totalPrice = totalPrice(days, el.zone);
        // console.log(el.totalPrice)
        return el;
      });
      // tickets.totalPrice = totalPrice
      console.log("HI DANIEL, ", allTickets);
      // totalPrice

      res.render("availableTickets.hbs", {
        allTickets,
        from,
        until,
        loggedIn: req.user
        // price: totalPrice
      });
    })
    .catch(err => {
      next(err);
    });
});

router.get("/profile/tickets/:ticketId/delete", loginCheck2(), (req, res) => {
  const query = {
    _id: req.params.ticketId
  };

  Ticket.deleteOne(query)
    .then(() => {
      res.redirect("/profile/tickets");
    })
    .catch(err => {
      next(err);
    });
});

router.post("/profile", loginCheck1(), (req, res, next) => {
  const id = req.user.id;
  User.findOneAndUpdate(
    {
      _id: id
    },
    {
      name: req.body.name,
      surname: req.body.surname,
      email: req.body.email
    },
    {
      new: true
    }
  )
    .then(updatedUser => {
      res.redirect("/profile");
    })
    .catch(err => console.log(err));
});

router.get("/about", (req, res) => {
  res.render("about", {
    loggedIn: req.user
  });
});

module.exports = router;
