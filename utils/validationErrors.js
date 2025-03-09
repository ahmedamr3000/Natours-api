const displayValidationErrors = (errors, res) => {

    let errorsObj = {}
    errors.array({ onlyFirstError: true}).map(err => {
        errorsObj[err.path] = err.msg
    })

    return res.status(400).json({
        status: "fail",
        message: "validation errors",
        errors: errorsObj
    })
}


module.exports = displayValidationErrors