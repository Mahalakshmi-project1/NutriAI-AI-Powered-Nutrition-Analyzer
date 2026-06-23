-- Seed the food database with common foods
INSERT INTO food_database (name, category, calories_per_serving, protein_per_serving, carbs_per_serving, fats_per_serving, fiber_per_serving, serving_size) VALUES
-- Fruits
('Apple', 'Fruits', 95, 0.5, 25, 0.3, 4.4, '1 medium'),
('Banana', 'Fruits', 105, 1.3, 27, 0.4, 3.1, '1 medium'),
('Orange', 'Fruits', 62, 1.2, 15, 0.2, 3.1, '1 medium'),
('Strawberries', 'Fruits', 49, 1, 12, 0.5, 3, '1 cup'),
('Blueberries', 'Fruits', 84, 1.1, 21, 0.5, 3.6, '1 cup'),
('Grapes', 'Fruits', 104, 1.1, 27, 0.2, 1.4, '1 cup'),

-- Vegetables
('Broccoli', 'Vegetables', 55, 3.7, 11, 0.6, 5.1, '1 cup'),
('Spinach', 'Vegetables', 7, 0.9, 1.1, 0.1, 0.7, '1 cup raw'),
('Carrots', 'Vegetables', 52, 1.1, 12, 0.3, 3.6, '1 medium'),
('Sweet Potato', 'Vegetables', 103, 2.3, 24, 0.1, 3.8, '1 medium'),
('Tomato', 'Vegetables', 22, 1.1, 4.8, 0.2, 1.5, '1 medium'),
('Cucumber', 'Vegetables', 16, 0.7, 3.6, 0.1, 0.5, '1 cup'),

-- Proteins
('Chicken Breast', 'Proteins', 165, 31, 0, 3.6, 0, '100g'),
('Salmon', 'Proteins', 208, 20, 0, 13, 0, '100g'),
('Eggs', 'Proteins', 155, 13, 1.1, 11, 0, '2 large'),
('Tuna', 'Proteins', 132, 28, 0, 1, 0, '100g can'),
('Beef Steak', 'Proteins', 271, 26, 0, 18, 0, '100g'),
('Tofu', 'Proteins', 94, 9.4, 2.3, 5.3, 0.3, '100g'),
('Greek Yogurt', 'Proteins', 100, 17, 6, 0.7, 0, '170g'),

-- Grains
('Brown Rice', 'Grains', 216, 5, 45, 1.8, 3.5, '1 cup cooked'),
('Oatmeal', 'Grains', 166, 6, 28, 3.6, 4, '1 cup cooked'),
('Whole Wheat Bread', 'Grains', 81, 4, 14, 1.1, 1.9, '1 slice'),
('Quinoa', 'Grains', 222, 8, 39, 3.6, 5, '1 cup cooked'),
('Pasta', 'Grains', 220, 8, 43, 1.3, 2.5, '1 cup cooked'),

-- Dairy
('Milk (Whole)', 'Dairy', 149, 8, 12, 8, 0, '1 cup'),
('Cheese (Cheddar)', 'Dairy', 113, 7, 0.4, 9, 0, '1 oz'),
('Cottage Cheese', 'Dairy', 206, 28, 6, 9, 0, '1 cup'),

-- Nuts & Seeds
('Almonds', 'Nuts & Seeds', 164, 6, 6, 14, 3.5, '1 oz'),
('Peanut Butter', 'Nuts & Seeds', 188, 8, 6, 16, 1.9, '2 tbsp'),
('Walnuts', 'Nuts & Seeds', 185, 4, 4, 18, 1.9, '1 oz'),

-- Snacks
('Dark Chocolate', 'Snacks', 170, 2.2, 13, 12, 3.1, '1 oz'),
('Popcorn (Air-popped)', 'Snacks', 31, 1, 6, 0.4, 1.2, '1 cup'),
('Hummus', 'Snacks', 70, 2, 6, 3.5, 1.4, '2 tbsp');