const response = {
  success: (res, data, message = "Berhasil", statusCode = 200) => {
    return res.status(statusCode).json({ success: true, message, data });
  },
  error: (res, message = "Terjadi kesalahan", statusCode = 500) => {
    return res.status(statusCode).json({ success: false, message });
  },
  created: (res, data, message = "Data berhasil dibuat") => {
    return res.status(201).json({ success: true, message, data });
  },
  paginate: (res, data, meta, message = "Berhasil") => {
    return res.status(200).json({ success: true, message, data, meta });
  },
};

module.exports = response;
