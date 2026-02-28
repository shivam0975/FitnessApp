using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace FitnessAppAPI.Models;

public partial class Workoutlog
{
    public Guid WorkoutLogId { get; set; }

    public Guid UserId { get; set; }

    public DateTime WorkoutDate { get; set; }

    public DateTime StartTime { get; set; }

    public DateTime? EndTime { get; set; }

    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public int? DurationMinutes { get; set; }

    public decimal? TotalCaloriesBurned { get; set; }

    public string WorkoutType { get; set; } = null!;

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual User User { get; set; } = null!;

    public virtual ICollection<Workoutexercise> Workoutexercises { get; set; } = new List<Workoutexercise>();
}
