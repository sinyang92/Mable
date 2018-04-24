<!DOCTYPE html>
<html>
<head>
    
    
<meta charset="utf-8" />

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>@ViewBag.Title - Mable</title>

<script type="text/javascript" src='@Url.Content("~/Scripts/jquery-1.10.2.min.js")'></script>

<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>

<script type="text/javascript" src="https://netdna.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>

<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.0.9/css/all.css" integrity="sha384-5SOiIsAziJl6AWe0HWRKTXlfcSHKmYV4RBF18PPJ173Kzn7jzMyFuTtk8JA7QQG1" crossorigin="anonymous">

<link href="~/Content/css/mable-style.css?version=1.4" rel="stylesheet" type="text/css">

<link href="https://fonts.googleapis.com/css?family=PT+Sans" rel="stylesheet">

<link rel="shortcut icon" type="favicon" href="~/favicon.png" />

</head>
<body>
    <div class="row">
        <div class="col-md-8 col-md-offset-2 text-center mable-error-message">
            <img src="~/Content/images/icon-search.svg" width="80" />
            <h1>Oops we could not find the place you were searching for!</h1>
            <h5>Error 404</h5>
        </div>
        <div class="row">
            <div class="col-md-12">
                <a href='@Url.Action("Index","Home")' class="btn mable-btn-secondaey">
                    Go back to Home
                </a>
            </div>
        </div>

    </div>
</body>
</html>