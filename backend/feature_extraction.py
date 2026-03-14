import numpy as np


def _euclidean(p1, p2):
    return np.linalg.norm(np.array(p1) - np.array(p2))


def compute_EAR(eye_points):
    p1, p2, p3, p4, p5, p6 = eye_points
    ear = (_euclidean(p2, p6) + _euclidean(p3, p5)) / (2.0 * _euclidean(p1, p4) + 1e-6)
    return float(ear)


def compute_MAR(mouth_points):
    p1, p2, p3, p4, p5, p6, p7 = mouth_points
    mar = (_euclidean(p3, p7) + _euclidean(p4, p6)) / (2.0 * _euclidean(p1, p5) + 1e-6)
    return float(mar)


def compute_brow_ratio(left_brow, right_brow, landmarks):
    left_avg = np.mean([landmarks[p][1] for p in left_brow])
    right_avg = np.mean([landmarks[p][1] for p in right_brow])
    brow_ratio = float((left_avg + right_avg) / 2.0)
    return brow_ratio


def compute_perclos(eye_aspect_ratio, baseline=0.25):
    perclos = max(0.0, min(1.0, (baseline - eye_aspect_ratio) / (baseline + 1e-6)))
    return float(perclos)

