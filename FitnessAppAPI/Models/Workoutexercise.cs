using System;
using System.Collections.Generic;

namespace FitnessAppAPI.Models;

public partial class Workoutexercise
{
    public Guid WorkoutExerciseId { get; set; }

    public Guid WorkoutLogId { get; set; }

    public Guid ExerciseId { get; set; }

    public int OrderIndex { get; set; }

    public int? Sets { get; set; }

    public int? Reps { get; set; }

    public decimal? WeightKg { get; set; }

    public int? DurationSeconds { get; set; }

    public decimal? DistanceKm { get; set; }

    public decimal? CaloriesBurned { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Exerciselibrary Exercise { get; set; } = null!;

    public virtual Workoutlog WorkoutLog { get; set; } = null!;
}
