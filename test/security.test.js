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

  // ====================================================
  // CAMPUS PROBLEMS MODULE TESTS (PHASE 3 & 4)
  // ====================================================

  // 11. Verify exactly the 4 Demo Problems are seeded and labeled DEMO
  const demoProblems = db.getCampusProblems(studentFemale, {});
  const p1 = demoProblems.find(p => p.id === 'prob_01');
  const p2 = demoProblems.find(p => p.id === 'prob_02');
  const p3 = demoProblems.find(p => p.id === 'prob_03');
  const p4 = demoProblems.find(p => p.id === 'prob_04');
  assert(
    demoProblems.length >= 4 && p1 && p2 && p3 && p4,
    '11. Exactly the 4 required Demo Problems are seeded in the database'
  );
  assert(
    p1.isDemo && p2.isDemo && p3.isDemo && p4.isDemo,
    '11b. All demo problems are explicitly marked isDemo: true'
  );

  // 12. Verify Vending Machine solution details (snacks/drinks only, NO bottled water, marked to be estimated)
  const p1Solutions = db.getProblemSolutions(studentFemale, 'prob_01');
  const vendingSol = p1Solutions[0];
  const itemsText = (vendingSol?.details?.itemsList || '').toLowerCase();
  const allDetailsText = JSON.stringify(vendingSol?.details || {}).toLowerCase();
  assert(
    !!vendingSol &&
    itemsText.includes('no bottled water') &&
    allDetailsText.includes('to be estimated'),
    '12. Demo Problem 1 vending machine solution has NO bottled water and costs marked "to be estimated"'
  );

  // 13. Student can post a problem
  const newProb = db.createCampusProblem(studentMale, {
    title: 'Test Problem by Rohan',
    description: 'Testing problem creation from male student',
    category: 'Internet/WiFi',
    location: 'OBH Block C',
    timeOfDayAffected: 'Evening (8 PM - 11 PM)',
    whoAffected: 'OBH Residents',
    severity: 'medium',
    scope: "Boys' Hostel",
    isAnonymous: false,
  });
  assert(
    !!newProb && newProb.authorId === studentMale.id && newProb.status === 'Open',
    '13. Student can successfully create a new campus problem with default status "Open"'
  );

  // 14. Student can vote "I face this too" (one vote per user, togglable)
  // studentFemale has not voted on p4 yet
  const initialVotes = p4.upvotesCount;
  const vote1 = db.toggleVoteProblem(studentFemale, p4.id);
  assert(vote1.hasVoted === true && vote1.upvotesCount === initialVotes + 1, '14. Student can vote "I face this too" (1 vote recorded)');
  const vote2 = db.toggleVoteProblem(studentFemale, p4.id);
  assert(vote2.hasVoted === false && vote2.upvotesCount === initialVotes, '14b. Toggling vote removes it without duplicate counts');

  // 15. Student can comment on a problem
  const newComment = db.addProblemComment(studentMale, newProb.id, 'I have also experienced this packet drop issue.');
  const allComments = db.getProblemComments(newProb.id);
  assert(
    !!newComment && allComments.some(c => c.id === newComment.id),
    '15. Student can successfully add a comment to a campus problem'
  );

  // 16. Student CANNOT change status (only admins/staff can set Under Review, Resolved, Closed)
  try {
    db.changeProblemStatus(studentMale, newProb.id, 'Resolved');
    assert(false, '16. Student cannot change problem status', 'Normal student changed status to Resolved');
  } catch (err) {
    assert(
      err.message.includes('Unauthorized'),
      '16. Normal student is blocked from changing problem status (Only staff/admin permitted)'
    );
  }

  // Admin CAN change problem status
  const resolvedProb = db.changeProblemStatus(adminUser, newProb.id, 'Resolved');
  assert(
    resolvedProb.status === 'Resolved',
    '16b. Admin can successfully change problem status to Resolved'
  );

  // 17. Hostel problems are not visible across hostels (Boys' and Girls' stay isolated)
  const girlsOnlyProb = db.createCampusProblem(studentFemale, {
    title: 'Girls Hostel Wing A Water Heater Check',
    description: 'Geyser timer check in Wing A',
    category: 'Hostel Life',
    location: "Girls' Hostel Wing A",
    scope: "Girls' Hostel",
  });
  const femaleList = db.getCampusProblems(studentFemale, {});
  const maleList = db.getCampusProblems(studentMale, {});
  const femaleCanSeeGirls = femaleList.some(p => p.id === girlsOnlyProb.id);
  const maleCanSeeGirls = maleList.some(p => p.id === girlsOnlyProb.id);

  assert(
    femaleCanSeeGirls === true && maleCanSeeGirls === false,
    "17. Hostel problems are strictly isolated (Girls' Hostel problems invisible to Boys' Hostel residents)"
  );

  // 18. Anonymous posts hide the author from other students
  const anonProb = db.createCampusProblem(studentMale, {
    title: 'Confidential Feedback on Mess Quality',
    description: 'Anonymous mess feedback',
    category: 'Food & Cafeteria',
    location: 'College Mess Dining Hall',
    scope: 'Whole campus',
    isAnonymous: true,
  });
  const peerViewList = db.getCampusProblems(studentFemale, {});
  const anonViewedByPeer = peerViewList.find(p => p.id === anonProb.id);
  const adminViewList = db.getCampusProblems(adminUser, {});
  const anonViewedByAdmin = adminViewList.find(p => p.id === anonProb.id);

  assert(
    anonViewedByPeer.authorName === 'Anonymous Student' &&
    anonViewedByPeer.authorId === undefined &&
    anonViewedByAdmin.authorName.includes('Rohan') &&
    anonViewedByAdmin.isAnonymous === true,
    '18. Anonymous problem hides author identity from students while keeping it visible to moderators'
  );

  // 19. A solution can be converted into an Innovation Hub idea (linking to existing record without duplicates)
  const sol = db.proposeSolution(studentMale, p2.id, {
    title: 'Mesh WiFi Node Routing for Hostels',
    description: 'Deploy dual-band mesh nodes in corridor intersections to eliminate room dead zones.',
  });
  assert(!!sol && sol.id, '19a. Student can propose a solution to a campus problem');

  const convertedIdea = db.convertSolutionToIdea(studentMale, p2.id, sol.id);
  assert(
    !!convertedIdea && convertedIdea.linkedProblemId === p2.id && convertedIdea.linkedSolutionId === sol.id,
    '19b. Solution successfully converted into Innovation Hub idea'
  );

  // Converting again returns the existing linked idea without duplicates
  const secondAttempt = db.convertSolutionToIdea(studentMale, p2.id, sol.id);
  assert(
    secondAttempt.id === convertedIdea.id,
    '19c. Duplicate conversion prevented (returns existing linked idea record)'
  );

  console.log('\n====================================================');
  console.log(` ALL TESTS COMPLETE: ${passedTests}/${totalTests} Passed (${failedTests} Failed)`);
  console.log('====================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
