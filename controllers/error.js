exports.Error404 = (req,res,next) =>{

    res.status(404).render('404', {pagetitle: 'Page Not Fount'});

};

exports.Error500 = (req,res,next) =>{

    res.status(500).render('500', {pagetitle: 'Internal Server Error'});

};