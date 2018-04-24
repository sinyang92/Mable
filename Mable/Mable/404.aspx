<!DOCTYPE html>
<html>
<head>
     @RenderPage("head.cshtml")
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