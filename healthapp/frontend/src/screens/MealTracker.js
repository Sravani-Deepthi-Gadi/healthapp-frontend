import React, { useEffect, useState } from "react";
import { 
  View, Text, Button, ScrollView, Alert, TouchableOpacity, StyleSheet 
} from "react-native";
import { Picker } from "@react-native-picker/picker"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const MealTracker = () => {
  const [foodItems, setFoodItems] = useState([]); 
  const [meals, setMeals] = useState({
    breakfast: [],
    lunch: [],
    snacks: [],
    dinner: [],
  });
  const [selectedMealItem, setSelectedMealItem] = useState({
    breakfast: "",
    lunch: "",
    snacks: "",
    dinner: "",
  });

  const navigation = useNavigation(); 

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      const response = await axios.get("https://flask-s8i3.onrender.com/api/get-food-items");
  
      console.log("API Response:", response.data); // Debugging Line
  
      if (response.data && Array.isArray(response.data.food_items)) {
        const formattedItems = response.data.food_items.map((foodName, index) => ({
          label: foodName,
          value: String(index), // Assigning index as an ID since API does not provide unique IDs
        }));
  
        console.log("Formatted Food Items:", formattedItems); // Debugging Line
        setFoodItems(formattedItems);
      } else {
        Alert.alert("⚠ Error", "Unexpected API response format.");
      }
    } catch (error) {
      Alert.alert("⚠ Error", "Failed to load food items.");
      console.error("API fetch error:", error);
    }
  };
  
  
  const addFoodToMeal = (mealType) => {
    const selectedFoodId = selectedMealItem[mealType];
  
    if (!selectedFoodId) {
      Alert.alert("⚠ Select a food item", "Please select a food item before adding.");
      return;
    }
  
    const selectedFood = foodItems.find(item => item.value === selectedFoodId);
    if (!selectedFood) return;
  
    if (!meals[mealType].some(food => food.id === selectedFood.value)) {
      setMeals((prevMeals) => ({
        ...prevMeals,
        [mealType]: [...prevMeals[mealType], { id: selectedFood.value, name: selectedFood.label }],
      }));
    }
  };
  
  const removeFoodFromMeal = (mealType, foodId) => {
    setMeals((prevMeals) => ({
      ...prevMeals,
      [mealType]: prevMeals[mealType].filter((item) => item.id !== foodId),
    }));
  };
  
  const logMeal = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("⚠ Login Required", "Please log in first.");
        return;
      }

      const hasMeals = Object.values(meals).some((meal) => meal.length > 0);
      if (!hasMeals) {
        Alert.alert("⚠ No Meals Selected", "Please add at least one meal before logging.");
        return;
      }

      await axios.post(
        "https://flask-s8i3.onrender.com/api/log-meal",
        { meals: meals }, 
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      Alert.alert("✅ Success", "Meal logged successfully!");
      navigation.replace("MealSummary"); 

    } catch (error) {
      console.error("Error logging meal:", error.response?.data || error);
      Alert.alert("⚠ Error", error.response?.data?.error || "Failed to log meal.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🍽 Meal Tracker</Text>

      {Object.keys(meals).map((mealType) => (
        <View key={mealType} style={styles.mealContainer}>
          <Text style={styles.mealTitle}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>

          <Picker
            selectedValue={selectedMealItem[mealType]}
            onValueChange={(itemValue) =>
              setSelectedMealItem({ ...selectedMealItem, [mealType]: itemValue })
            }
            style={styles.picker}
          >
            <Picker.Item label="Select a food item" value="" />
            {foodItems.map((item) => (
              <Picker.Item key={item.value} label={item.label} value={item.value} />
            ))}
          </Picker>

          <Button title="➕ Add to Meal" onPress={() => addFoodToMeal(mealType)} />

          {meals[mealType].length > 0 ? (
            <View style={styles.selectedItemsContainer}>
              {meals[mealType].map((food) => (
                <View key={food.id} style={styles.selectedItem}>
                  <Text>{food.name}</Text>
                  <TouchableOpacity onPress={() => removeFoodFromMeal(mealType, food.id)}>
                    <Text style={styles.removeText}>❌</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noItemsText}>No items selected</Text>
          )}

        </View>
      ))}

      <View style={styles.logMealButtonContainer}>
        <Button title="✅ Log Meal" onPress={logMeal} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, paddingBottom: 50 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  mealContainer: { marginBottom: 20, padding: 10, backgroundColor: "#f8f8f8", borderRadius: 10, borderWidth: 1, borderColor: "#ddd" },
  mealTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  picker: { height: 50, backgroundColor: "#f2f2f2", marginBottom: 10 },
  selectedItemsContainer: { marginTop: 10 },
  selectedItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#e1f5fe", padding: 5, marginVertical: 2, borderRadius: 5 },
  removeText: { color: "red", fontWeight: "bold", paddingHorizontal: 5 },
  noItemsText: { textAlign: "center", color: "#666", fontStyle: "italic", marginTop: 5 },
  logMealButtonContainer: { marginTop: 20 },
});

export default MealTracker;
