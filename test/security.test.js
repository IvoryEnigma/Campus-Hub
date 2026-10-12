// Comprehensive Security and Role Test Suite for AIT Campus Hub
// Tests all 10 criteria specified in Requirement 16

import { db } from '../server/db.js';

console.log('====================================================');
console.log(' AIT CAMPUS HUB — AUTOMATED SECURITY & ROLE TEST SUITE');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] Test ${totalTests}: ${testName}`);
  } else {
    failedTests++;
    console.error(`[FAIL] Test ${totalTests}: ${testName}`);
    if (details) console.error(`       Details: ${details}`);
  }
}

async function runTests() {
  const studentFemale = db.findRawUserById('user_stu_ananya'); // Girls' Hostel resident
  const studentMale = db.findRawUserById('user_stu_rohan'); // Boys' Hostel resident
  const unverifiedAlumni = db.findRawUserById('user_alumni_vikram'); // Unverified alumni
  const verifiedAlumni = db.findRawUserById('user_alumni_priya'); // Verified alumni
  const adminUser = db.findRawUserById('user_admin'); // Campus administrator
  const facultyUser = db.findRawUserById('user_faculty_deshmukh'); // Faculty HOD

  // 1. Normal student cannot access administrator functions
  try {
    db.getPendingAlumniVerifications(studentFemale);
    assert(false, '1. Normal student cannot access administrator functions', 'Student should have thrown unauthorized error');
  } catch (err) {
    assert(err.message.includes('Unauthorized'), '1. Normal student cannot access administrator functions');
  }

  // 2. A student cannot publish an official notice without permission
  try {
    db.createMessage(studentFemale, {
      communitySlug: 'fe-announcements',
      title: 'Hacked Official Notice',
      content: 'This should be blocked',
      isOfficial: true,
    });
    assert(false, '2. Student cannot publish an official notice without permission', 'Student published official notice');
  } catch (err) {
    assert(err.message.includes('Unauthorized'), '2. Student cannot publish an official notice without permission');
  }

  // 3. A student cannot change their role by modifying a profile update request
  const beforeRole = studentFemale.role;
  db.updateUserProfile(studentFemale.id, {
    displayName: 'Ananya Sharma Updated',
    role: 'admin',
    verified: true,
    hostelAssignment: "Boys' Hostel",
  });
  const afterUser = db.findRawUserById(studentFemale.id);
  assert(
    afterUser.role === beforeRole && afterUser.hostelAssignment === "Girls' Hostel",
    '3. A student cannot change their role or hostel by modifying a request'
  );

  // 4. A user cannot access a restricted hostel community they do not belong to
  const boysHostelComm = db.findCommunityBySlug('hostel-boys');
  const femaleHasAccess = db.checkCommunityAccess(studentFemale, boysHostelComm);
  assert(
    femaleHasAccess === false,
    '4. A user cannot access a restricted hostel community (Female student denied Boys Hostel access)'
  );

  // 5. Girls' Hostel and Boys' Hostel content remain isolated
  const girlsHostelComm = db.findCommunityBySlug('hostel-girls');
  const maleHasAccessToGirls = db.checkCommunityAccess(studentMale, girlsHostelComm);
  const femaleHasAccessToGirls = db.checkCommunityAccess(studentFemale, girlsHostelComm);
  const maleHasAccessToBoys = db.checkCommunityAccess(studentMale, boysHostelComm);

  assert(
    maleHasAccessToGirls === false && femaleHasAccessToGirls === true && maleHasAccessToBoys === true,
    "5. Girls' Hostel and Boys' Hostel content remain strictly isolated"
  );

  // Verify that messages from Boys' Hostel do NOT leak into Girls' resident inbox/messages query
  const femaleMessages = db.getMessages(studentFemale, {});
  const leakedBoysHostelMsg = femaleMessages.find((m) => m.communitySlug === 'hostel-boys');
  assert(
    !leakedBoysHostelMsg,
    "5b. Boys' Hostel messages do not leak into female student inbox or queries"
  );

  // 6. An unverified alumni account cannot publish verified opportunities
  try {
    db.createOpportunity(unverifiedAlumni, {
      title: 'Fake Unverified Opportunity',
      company: 'Fake Corp',
      role: 'Intern',
      description: 'Should be rejected',
    });
    assert(false, '6. Unverified alumni cannot publish opportunities', 'Unverified alumni managed to create opportunity');
  } catch (err) {
    assert(err.message.includes('Unauthorized'), '6. An unverified alumni account cannot publish verified opportunities');
  }

  // Verified alumni CAN publish opportunities
  try {
    const opp = db.createOpportunity(verifiedAlumni, {
      title: '[DEMO] Cloud Engineering Mentorship Role',
      company: 'Microsoft India',
      role: 'Mentee / Intern',
      description: 'Verified alumni mentorship opening.',
    });
    assert(!!opp && opp.isVerified === true, '6b. Verified alumni successfully publishes verified opportunity');
  } catch (err) {
    assert(false, '6b. Verified alumni opportunity creation failed', err.message);
  }

  // 7. Public profiles do not reveal private registration numbers or contact details
  const publicStudent = db.findUserById('user_stu_ananya');
  assert(
    publicStudent.displayName === 'Ananya Sharma Updated' &&
    publicStudent.regNumber === undefined &&
    publicStudent.email === undefined &&
    publicStudent.phone === undefined &&
    publicStudent.admissionBatch === undefined,
    '7. Public profiles do not reveal private registration numbers, emails, or phone numbers'
  );

  // 8. Search and notifications do not expose unauthorized content
  const searchResults = db.getMessages(studentFemale, { search: 'solar' });
  const hasAuthorizedResult = searchResults.some((m) => m.communitySlug === 'hostel-girls');
  const maleSearchResults = db.getMessages(studentMale, { search: 'solar' });
  const maleFoundGirlsNotice = maleSearchResults.some((m) => m.communitySlug === 'hostel-girls');

  assert(
    hasAuthorizedResult && !maleFoundGirlsNotice,
    '8. Search does not expose unauthorized restricted content'
  );

  // 9. All 29 Club Channels are properly seeded and accessible
  const communities = db.getCommunities(studentFemale);
  const clubCount = communities.filter((c) => c.category === 'club').length;
  assert(clubCount === 29, `9. Exactly 29 club channels exist in database (found ${clubCount})`);

  // Verify specific club channel name
  const gdscClub = communities.find((c) => c.name === 'Google Development Student Club (GDSC)');
  const caeClub = communities.find((c) => c.name === 'Centre of Excellence for AI & Robotics');
  assert(!!gdscClub && !!caeClub, '9b. Club names match required nomenclature');

  // 10. Existing Innovation Hub functionality remains operational
  const initialLikes = db.getIdeas(studentFemale)[0].likesCount;
  const toggleLikeRes = db.toggleLikeIdea(studentFemale, 'idea_01');
  const ideaComments = db.getIdeaComments('idea_01');
  const projects = db.getProjects();

  assert(
    projects.length >= 2 && ideaComments.length >= 1 && typeof toggleLikeRes.likesCount === 'number',
    '10. Innovation Hub ideas, projects, likes, and comments are fully intact and functional'
  );

  console.log('\n====================================================');
  console.log(` TEST SUMMARY: ${passedTests}/${totalTests} Passed (${failedTests} Failed)`);
  console.log('====================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
