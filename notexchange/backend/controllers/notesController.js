const uploadNote = async (req, res) => {
  const { title, description, userId } = req.body;
  const file = req.file;

  // if (!file) return res.status(400).json({ msg: 'No file uploaded' });
  // const { title, description, userId } = req.body;

if (!userId || userId.length !== 24) {
  return res.status(400).json({ msg: 'Invalid or missing userId' });
}


  const bucket = getGridFSBucket();
  const uploadStream = bucket.openUploadStream(file.originalname);
  const filePath = path.join(__dirname, '../uploads/', file.filename);

  const readStream = fs.createReadStream(filePath);

  readStream.pipe(uploadStream);

  // handle success
  uploadStream.on('finish', async () => {
    try {
      console.log('Saving note with userId:', userId); // add this

const newNote = new Note({
  title,
  description,
  filename: file.originalname,
  fileId: uploadStream.id,
  uploadedBy: userId, // this is the likely cause
});
      await newNote.save();
      fs.unlinkSync(filePath); // delete temp file
      res.status(200).json({ msg: 'Note uploaded successfully' });
    } catch (err) {
      console.error('Error saving note:', err);
      res.status(500).json({ msg: 'Error saving note' });
    }
  });

  // handle error
  uploadStream.on('error', (err) => {
    console.error('Upload stream error:', err);
    fs.unlinkSync(filePath); // clean up temp file
    res.status(500).json({ msg: 'Upload failed during streaming' });
  });

  
};
