import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const MealSummary = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalNutrition, setTotalNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });

  useEffect(() => {
    fetchLoggedMeals();
  }, []);

  const fetchLoggedMeals = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Login Required", "Please log in first.");
        return;
      }

      const response = await axios.get("https://flask-s8i3.onrender.com/api/get-logged-meals", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { meals } = response.data;
      if (!meals.length) {
        Alert.alert("No Meals Found", "You haven't logged any meals yet.");
      }

      setMeals(meals);
      if (meals.length) calculateTotalNutrition(meals);
    } catch (error) {
      console.error("Error fetching meals:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to load meals.");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalNutrition = (meals) => {
    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + (meal.nutrition?.calories || 0),
        protein: acc.protein + (meal.nutrition?.protein || 0),
        carbs: acc.carbs + (meal.nutrition?.carbs || 0),
        fats: acc.fats + (meal.nutrition?.fats || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    setTotalNutrition(totals);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toISOString().split("T")[0];
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>🍽 Meal Summary</Text>

      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <>
          <View style={{ marginBottom: 20, padding: 10, backgroundColor: "#eee", borderRadius: 10 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>🔥 Total Nutrition</Text>
            <Text>🔥 Calories: {totalNutrition.calories} kcal</Text>
            <Text>💪 Protein: {totalNutrition.protein} g</Text>
            <Text>🥖 Carbs: {totalNutrition.carbs} g</Text>
            <Text>🧈 Fats: {totalNutrition.fats} g</Text>
          </View>

          <FlatList
            data={meals}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={{ padding: 10, borderWidth: 1, marginBottom: 10, borderRadius: 10 }}>
                <Text style={{ fontWeight: "bold" }}>📅 Date: {formatDate(item.date)}</Text>
                <Text>🍳 Breakfast: {item.meals?.breakfast || "Not logged"}</Text>
                <Text>🥗 Lunch: {item.meals?.lunch || "Not logged"}</Text>
                <Text>🍪 Snacks: {item.meals?.snacks || "Not logged"}</Text>
                <Text>🍽 Dinner: {item.meals?.dinner || "Not logged"}</Text>
                <Text>🔥 Calories: {item.nutrition?.calories || 0} kcal</Text>
                <Text>💪 Protein: {item.nutrition?.protein || 0} g</Text>
                <Text>🥖 Carbs: {item.nutrition?.carbs || 0} g</Text>
                <Text>🧈 Fats: {item.nutrition?.fats || 0} g</Text>
              </View>
            )}
          />
        </>
      )}
    </View>
  );
};

export default MealSummary;
