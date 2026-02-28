using System;
using System.Collections.Generic;

namespace FitnessAppAPI.Models;

public partial class VwWeeklycalorietrend
{
    public Guid UserId { get; set; }

    public int? Year { get; set; }

    public int? WeekNumber { get; set; }

    public DateTime? WeekStart { get; set; }

    public long WorkoutCount { get; set; }

    public decimal? TotalMinutes { get; set; }

    public decimal? TotalCalories { get; set; }
}
