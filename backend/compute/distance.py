import numpy as np

def get_eucdis(TS1, TS2):
    Eucdis = np.linalg.norm(TS1 - TS2)
    return Eucdis

