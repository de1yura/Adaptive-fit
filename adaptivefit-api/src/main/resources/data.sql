-- Exercise Library Seed Data
-- 60 exercises across 10 muscle groups with all equipment types and difficulty levels

-- Chest (6 exercises)
INSERT IGNORE INTO exercise_library (name, muscle_group, equipment_required, difficulty, description) VALUES
('Push-Up', 'Chest', 'NONE', 'BEGINNER', 'Standard push-up targeting chest, shoulders, and triceps. Keep body in a straight line from head to heels.'),
('Decline Push-Up', 'Chest', 'NONE', 'INTERMEDIATE', 'Feet-elevated push-up that increases load on upper chest and shoulders.'),
('Diamond Push-Up', 'Chest', 'NONE', 'ADVANCED', 'Hands placed close together in a diamond shape, emphasizing inner chest and triceps.'),
('Dumbbell Bench Press', 'Chest', 'DUMBBELLS', 'BEGINNER', 'Pressing dumbbells upward while lying on a flat bench. Allows greater range of motion than barbell.'),
('Barbell Bench Press', 'Chest', 'BARBELL', 'INTERMEDIATE', 'Classic compound press on a flat bench with a barbell. Primary chest builder.'),
('Cable Crossover', 'Chest', 'CABLE_MACHINE', 'INTERMEDIATE', 'Standing cable fly bringing handles together in front of the chest for peak contraction.');

-- Back (7 exercises)
INSERT IGNORE INTO exercise_library (name, muscle_group, equipment_required, difficulty, description) VALUES
('Superman', 'Back', 'NONE', 'BEGINNER', 'Lying face down, simultaneously lift arms and legs off the ground to strengthen the lower back.'),
('Inverted Row', 'Back', 'NONE', 'INTERMEDIATE', 'Pulling the body up to a bar set at waist height while keeping feet on the ground.'),
('Pull-Up', 'Back', 'NONE', 'ADVANCED', 'Hang from a bar with overhand grip and pull body up until chin clears the bar.'),
('Dumbbell Row', 'Back', 'DUMBBELLS', 'BEGINNER', 'Single-arm row with one knee on a bench, pulling dumbbell toward the hip.'),
('Barbell Bent-Over Row', 'Back', 'BARBELL', 'INTERMEDIATE', 'Hinged forward at the hips, row a barbell toward the lower chest.'),
('Lat Pulldown', 'Back', 'CABLE_MACHINE', 'BEGINNER', 'Seated cable pulldown bringing the bar to the upper chest, targeting the latissimus dorsi.'),
('Seated Cable Row', 'Back', 'CABLE_MACHINE', 'INTERMEDIATE', 'Seated row using a cable machine with a V-bar or wide grip handle for mid-back development.');

-- Shoulders (6 exercises)
INSERT IGNORE INTO exercise_library (name, muscle_group, equipment_required, difficulty, description) VALUES
('Arm Circles', 'Shoulders', 'NONE', 'BEGINNER', 'Standing with arms extended, rotate in small circles to warm up and build shoulder endurance.'),
('Pike Push-Up', 'Shoulders', 'NONE', 'INTERMEDIATE', 'Push-up in an inverted V position to shift emphasis onto the shoulders.'),
('Wall Handstand Hold', 'Shoulders', 'NONE', 'ADVANCED', 'Hold a handstand against a wall to build shoulder stability, strength, and balance.'),
('Dumbbell Shoulder Press', 'Shoulders', 'DUMBBELLS', 'BEGINNER', 'Press dumbbells overhead from shoulder height while seated or standing.'),
('Lateral Raise', 'Shoulders', 'DUMBBELLS', 'BEGINNER', 'Raise dumbbells out to the sides until arms are parallel to the floor, targeting lateral deltoids.'),
('Barbell Overhead Press', 'Shoulders', 'BARBELL', 'INTERMEDIATE', 'Standing strict press driving a barbell from shoulder level to full lockout overhead.');

-- Quadriceps (7 exercises)
INSERT IGNORE INTO exercise_library (name, muscle_group, equipment_required, difficulty, description) VALUES
('Bodyweight Squat', 'Quadriceps', 'NONE', 'BEGINNER', 'Standard squat using only bodyweight. Fundamental movement pattern for lower body strength.'),
('Wall Sit', 'Quadriceps', 'NONE', 'BEGINNER', 'Isometric hold with back against a wall and thighs parallel to the floor.'),
('Jump Squat', 'Quadriceps', 'NONE', 'INTERMEDIATE', 'Explosive squat variation with a jump at the top for power development.'),
('Pistol Squat', 'Quadriceps', 'NONE', 'ADVANCED', 'Single-leg squat requiring significant balance, mobility, and unilateral strength.'),
('Goblet Squat', 'Quadriceps', 'DUMBBELLS', 'BEGINNER', 'Squat holding a dumbbell at chest height with both hands for an upright torso position.'),
('Barbell Back Squat', 'Quadriceps', 'BARBELL', 'INTERMEDIATE', 'Squat with a barbell across the upper back. King of lower body compound exercises.'),
('Leg Press', 'Quadriceps', 'FULL_GYM', 'BEGINNER', 'Machine-based pressing movement targeting quadriceps with back support.');

-- Hamstrings (6 exercises)
INSERT IGNORE INTO exercise_library (name, muscle_group, equipment_required, difficulty, description) VALUES
('Glute Bridge March', 'Hamstrings', 'NONE', 'BEGINNER', 'Hold a glute bridge while alternating lifting each foot off the ground to engage hamstrings.'),
('Single-Leg Deadlift', 'Hamstrings', 'NONE', 'INTERMEDIATE', 'Stand on one leg and hinge forward, extending the other leg behind for balance and hamstring work.'),
('Good Morning', 'Hamstrings', 'NONE', 'INTERMEDIATE', 'Standing hip hinge with hands behind the head, stretching and strengthening hamstrings.'),
('Nordic Curl', 'Hamstrings', 'NONE', 'ADVANCED', 'Kneeling hamstring curl where you slowly lower your body forward under control.'),
('Dumbbell Romanian Deadlift', 'Hamstrings', 'DUMBBELLS', 'INTERMEDIATE', 'Hip hinge holding dumbbells, lowering them along the legs while keeping a slight knee bend.'),
('Leg Curl Machine', 'Hamstrings', 'FULL_GYM', 'BEGINNER', 'Machine-based hamstring curl performed lying or seated for isolated hamstring work.');

-- Glutes (6 exercises)
INSERT IGNORE INTO exercise_library (name, muscle_group, equipment_required, difficulty, description) VALUES
('Glute Bridge', 'Glutes', 'NONE', 'BEGINNER', 'Lying on back with knees bent, drive hips upward squeezing glutes at the top.'),
('Single-Leg Glute Bridge', 'Glutes', 'NONE', 'INTERMEDIATE', 'Glute bridge performed on one leg to increase difficulty and address imbalances.'),
('Donkey Kick', 'Glutes', 'NONE', 'BEGINNER', 'On all fours, drive one leg up and back while keeping knee bent at 90 degrees.'),
('Clamshell', 'Glutes', 'NONE', 'BEGINNER', 'Lying on side with knees bent, open top knee like a clamshell to activate gluteus medius.'),
('Dumbbell Hip Thrust', 'Glutes', 'DUMBBELLS', 'INTERMEDIATE', 'Hip thrust with upper back on a bench and a dumbbell across the hips for added resistance.'),
('Barbell Hip Thrust', 'Glutes', 'BARBELL', 'INTERMEDIATE', 'Hip thrust with upper back on a bench and a barbell across the hips. Primary glute builder.');

-- Biceps (5 exercises)
INSERT IGNORE INTO exercise_library (name, muscle_group, equipment_required, difficulty, description) VALUES
('Isometric Bicep Hold', 'Biceps', 'NONE', 'BEGINNER', 'Hold arms at 90 degrees with palms up, squeezing biceps isometrically for time.'),
('Chin-Up', 'Biceps', 'NONE', 'INTERMEDIATE', 'Hang from a bar with underhand grip and pull body up, emphasizing biceps.'),
('Dumbbell Bicep Curl', 'Biceps', 'DUMBBELLS', 'BEGINNER', 'Standing curl with dumbbells, alternating or simultaneous, for bicep isolation.'),
('Hammer Curl', 'Biceps', 'DUMBBELLS', 'BEGINNER', 'Curl with neutral grip targeting the brachialis and brachioradialis alongside biceps.'),
('Cable Curl', 'Biceps', 'CABLE_MACHINE', 'INTERMEDIATE', 'Standing curl using a cable machine for constant tension throughout the range of motion.');

-- Triceps (5 exercises)
INSERT IGNORE INTO exercise_library (name, muscle_group, equipment_required, difficulty, description) VALUES
('Close-Grip Push-Up', 'Triceps', 'NONE', 'BEGINNER', 'Push-up with hands placed shoulder-width or narrower to emphasize triceps.'),
('Bodyweight Tricep Dip', 'Triceps', 'NONE', 'INTERMEDIATE', 'Dip using a bench or parallel surface, lowering and pressing body up with triceps.'),
('Dumbbell Tricep Extension', 'Triceps', 'DUMBBELLS', 'BEGINNER', 'Overhead extension with a dumbbell held in both hands, isolating the triceps.'),
('Cable Tricep Pushdown', 'Triceps', 'CABLE_MACHINE', 'BEGINNER', 'Push a cable attachment downward from chest height to full arm extension.'),
('Barbell Skull Crusher', 'Triceps', 'BARBELL', 'INTERMEDIATE', 'Lying on a bench, lower a barbell toward the forehead and extend back up for tricep isolation.');

-- Core (7 exercises)
INSERT IGNORE INTO exercise_library (name, muscle_group, equipment_required, difficulty, description) VALUES
('Plank', 'Core', 'NONE', 'BEGINNER', 'Hold a straight-body position on forearms and toes, engaging the entire core.'),
('Dead Bug', 'Core', 'NONE', 'BEGINNER', 'Lying on back, extend opposite arm and leg while keeping lower back pressed to the floor.'),
('Mountain Climber', 'Core', 'NONE', 'BEGINNER', 'From plank position, alternate driving knees toward chest at a quick pace.'),
('Bicycle Crunch', 'Core', 'NONE', 'INTERMEDIATE', 'Lying on back, alternate bringing elbow to opposite knee in a cycling motion.'),
('Leg Raise', 'Core', 'NONE', 'INTERMEDIATE', 'Lying on back, raise straight legs from the floor to vertical, targeting lower abs.'),
('Dumbbell Russian Twist', 'Core', 'DUMBBELLS', 'INTERMEDIATE', 'Seated with feet off ground, rotate a dumbbell side to side to target obliques.'),
('Cable Woodchop', 'Core', 'CABLE_MACHINE', 'INTERMEDIATE', 'Rotational pull from high to low using a cable machine, engaging obliques and core.');

-- Full Body (5 exercises)
INSERT IGNORE INTO exercise_library (name, muscle_group, equipment_required, difficulty, description) VALUES
('Bear Crawl', 'Full Body', 'NONE', 'BEGINNER', 'Crawl forward on hands and feet with knees hovering just above the ground.'),
('Jumping Jack', 'Full Body', 'NONE', 'BEGINNER', 'Jump while spreading legs and raising arms overhead, then return to standing.'),
('Burpee', 'Full Body', 'NONE', 'INTERMEDIATE', 'Squat down, kick feet back to plank, perform a push-up, jump feet forward, and leap up.'),
('Dumbbell Thruster', 'Full Body', 'DUMBBELLS', 'INTERMEDIATE', 'Front squat into an overhead press in one fluid motion using dumbbells.'),
('Barbell Clean and Press', 'Full Body', 'BARBELL', 'ADVANCED', 'Explosive lift from floor to shoulders, then press overhead. Full-body power movement.');
