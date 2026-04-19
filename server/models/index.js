require('./models/Student');
require('./models/Scholarship');
require('./models/Application');
require('./models/Admin');
require('./models/Settings');

module.exports = {
  Student: require('./models/Student'),
  Scholarship: require('./models/Scholarship'),
  Application: require('./models/Application'),
  Admin: require('./models/Admin'),
  Settings: require('./models/Settings')
};
