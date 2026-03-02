using System;
using System.Collections.Generic;

namespace FitnessAppAPI.Models;

public partial class Nutritionlog
{
    public Guid NutritionLogId { get; set; }

    public Guid UserId { get; set; }

    public DateTime LogDate { get; set; }

    public string MealType { get; set; } = null!;

    public string FoodName { get; set; } = null!;

    public decimal ServingAmount { get; set; }

    public string ServingUnit { get; set; } = null!;

    public decimal CaloriesKcal { get; set; }

    public decimal? ProteinG { get; set; }

    public decimal? CarbsG { get; set; }

    public decimal? FatG { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
