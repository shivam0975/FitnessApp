using System;
using System.Collections.Generic;

namespace FitnessAppAPI.Models;

public partial class Exerciselibrary
{
    public Guid ExerciseId { get; set; }

    public string ExerciseName { get; set; } = null!;

    public string Category { get; set; } = null!;

    public string? MuscleGroup { get; set; }

    public decimal MetValue { get; set; }

    public string DifficultyLevel { get; set; } = null!;

    public string? Instructions { get; set; }

    public bool? IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<Workoutexercise> Workoutexercises { get; set; } = new List<Workoutexercise>();
}
