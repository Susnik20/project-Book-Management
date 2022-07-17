const aws = require("aws-sdk")
exports.testme = function (req, res) {
    res.status(200).send({ status: true, msg: "Api's is  running  Succssefully............." })
}
aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})
let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {

        
        let s3 = new aws.S3({ apiVersion: "2006-03-01" })

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",
            Key: "kaluram/" + file.originalname, 
            Body: file.buffer
        }
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "Error": err })
            }
            console.log(data)
            console.log("file uploaded successefully....")
            return resolve(data.Location)
        })
    })
}
exports.amazonaws = async function (req, res) {
    try {
        let files = req.files
        if (files && files.length > 0) {
          
            let uploadedFileURL = await uploadFile(files[0])
            res.status(201).send({ status: true, msg: "file uploaded successfully", data: uploadedFileURL })
        }
        else {
            res.status(400).send({ status: false, msg: "No file found" })
        }
    } catch (Err) {
        console.log(Err)
        res.status(500).send({ status: false, msg: Message.Err })
    }
}

