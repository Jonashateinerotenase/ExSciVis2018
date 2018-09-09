#include <iostream>
#include <fstream>
#include <limits>
#include <vector>

#define GRIDFINENESS 9 //

#define ARRAYW (504 / GRIDFINENESS) + 1
#define ARRAYH (523 / GRIDFINENESS) + 1
#define ARRAYD (344 / GRIDFINENESS) + 1

int main() 
{

  std::string file = "Concrete_w504_h523_d344_c1_b8.raw";

  std::ifstream in(file, std::ios::binary | std::ios::ate);
  auto length = in.tellg();
  in.seekg(0, std::ios::beg);
  //        w  h  d   
  unsigned long long int addup[ARRAYW][ARRAYH][ARRAYD];
  int countaddups[ARRAYW][ARRAYH][ARRAYD];
 
  //Werte Aus file einlesen und in addup speichern
//Concrete_w504_h523_d344_c1_b8
  std::vector<unsigned char> data; //8 bit
  for (size_t d = 0; d < (344); ++d) 
  {
    for (size_t h = 0; h < (523); ++h) 
    {
      for (size_t w = 0; w < (504); ++w) 
      {
        unsigned char dE; //16 bit 1 148 701 632
        in.read((char*)&dE, sizeof(unsigned char));
        
        addup[(int)(w / GRIDFINENESS)][(int)(h / GRIDFINENESS)][(int)(d / GRIDFINENESS)] += (int)dE;

        countaddups[(int)(w / GRIDFINENESS)][(int)(h / GRIDFINENESS)][(int)(d / GRIDFINENESS)]++;
      }
    }
  }

  in.close();
//taking the mean by deviding the max value
  for (size_t d = 0; d < (ARRAYD); ++d) 
  {
    for (size_t h = 0; h < (ARRAYH); ++h) 
    {
      for (size_t w = 0; w < (ARRAYW); ++w) 
      {
        float mean = (float)addup[w][h][d] / (float)countaddups[w][h][d];
        addup[w][h][d] = (unsigned int)mean; 
      }
    }
  }


  for (size_t d = 0; d < (344); ++d) 
  {
    for (size_t h = 0; h < (523); ++h) 
    {
      for (size_t w = 0; w < (504); ++w) 
      {
        unsigned char value3D;

        value3D = (unsigned char)addup[(int)(w / GRIDFINENESS)][(int)(h / GRIDFINENESS)][(int)(d / GRIDFINENESS)];

        data.push_back((unsigned char)value3D);
      }
    }
  }


  

  std::ofstream out("ConcreteAVG_w504_h523_d344_c1_b8.raw", std::ios::binary);
  out.write((char*)&data[0], data.size()*sizeof(char));
  out.close();


  return 0;
}
