# Tests for generate.py

from generate import MatchData
import os
import time

def main():
    match_to_test = input("Enter match dir to test\n")
    start_time = time.time()
    for match in os.listdir('data/'):
        if not match == match_to_test:
            continue
        else:
            print("Testing with ", match)
            match_data = MatchData(match, test_mode=True)
            match_data.stats_hbar()
            match_data.rank_table()
            match_data.possession_graph()
            break
    
    end_time = time.time()
    print("Test ended in {0} seconds".format(end_time - start_time))

if __name__ == "__main__":
    main()